package com.example.application.exam;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.*;

@Service
@Transactional
public class ExamService {
  private final LearnerRepository users;
  private final ExamAttemptRepository attempts;
  private final ExamCatalog catalog;
  private final ObjectMapper mapper;
  public ExamService(LearnerRepository users, ExamAttemptRepository attempts, ExamCatalog catalog, ObjectMapper mapper) {
    this.users=users; this.attempts=attempts; this.catalog=catalog; this.mapper=mapper;
  }
  private Learner user(String email) {
    return users.findById(email).or(() -> users.findByEmail(email)).filter(Learner::isActive).orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED,"Please log in again."));
  }
  private ExamAttempt owned(String id, String email, boolean lock) {
    var a=(lock ? attempts.lockById(id) : attempts.findById(id))
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND,"Attempt not found."));
    // Return the same response for missing and foreign attempts to avoid disclosing their existence.
    if (!a.getUserId().equals(user(email).getId())) throw new ResponseStatusException(NOT_FOUND,"Attempt not found.");
    if (!attempts.findFirstByUserIdAndExamIdOrderByAttemptNumberDesc(a.getUserId(),a.getExamId()).orElseThrow().getId().equals(a.getId()))
      throw new ResponseStatusException(NOT_FOUND,"Only your current attempt is available.");
    return a;
  }
  private void active(ExamAttempt a) {
    if (!a.getStatus().equals("ACTIVE")) throw new ResponseStatusException(CONFLICT,"This exam has already been submitted.");
  }
  private void submitted(ExamAttempt a) {
    if (!a.getStatus().equals("SUBMITTED")) throw new ResponseStatusException(CONFLICT,"Submit the exam before viewing results or answers.");
  }
  private String json(Object value) {
    try { return mapper.writeValueAsString(value); } catch (Exception e) { throw new IllegalStateException("Cannot encode exam data",e); }
  }
  private ExamCatalog.Definition definition(ExamAttempt a) {
    try { return mapper.readValue(a.getSnapshot(),ExamCatalog.Definition.class); }
    catch (Exception e) { throw new IllegalStateException("Cannot read exam snapshot",e); }
  }
  private Map<String,Object> savedResult(ExamAttempt a) {
    try { return mapper.readValue(a.getResultJson(),new TypeReference<Map<String,Object>>(){}); }
    catch (Exception e) { throw new IllegalStateException("Cannot read result",e); }
  }
  private Map<String,Object> safeAttempt(ExamAttempt a) {
    var out=new LinkedHashMap<>(ExamCatalog.safe(definition(a)));
    out.put("examId",a.getExamId()); out.put("attemptId",a.getId()); out.put("status",a.getStatus());
    out.put("attemptNumber",a.getAttemptNumber());
    out.put("startedAt",a.getStartedAt()); out.put("currentQuestion",a.getCurrentQuestion());
    out.put("answers",new TreeMap<>(a.getAnswers())); return out;
  }
  public Map<String,Object> start(String examId, String email) {
    var exam=catalog.get(examId);
    var u=user(email);
    users.lockById(u.getId()).orElseThrow();
    var a=attempts.findFirstByUserIdAndExamIdAndStatus(u.getId(),examId,"ACTIVE").orElseGet(() -> {
      var created=new ExamAttempt(); created.setId(UUID.randomUUID().toString()); created.setUserId(u.getId());
      created.setStudentName(u.getName());
      created.setAttemptNumber(attempts.findFirstByUserIdAndExamIdOrderByAttemptNumberDesc(u.getId(),examId).map(previous -> previous.getAttemptNumber()+1).orElse(1));
      created.setExamId(exam.id()); created.setTitle(exam.title()); created.setStatus("ACTIVE");
      created.setStartedAt(Instant.now()); created.setSnapshot(json(exam)); return attempts.save(created);
    });
    return safeAttempt(a);
  }
  @Transactional(readOnly=true)
  public Map<String,Object> attempt(String id,String email) { return safeAttempt(owned(id,email,false)); }
  public Map<String,Object> answer(String id,String email,int questionId,String selected) {
    var a=owned(id,email,true); active(a);
    var q=definition(a).questions().stream().filter(x -> x.id()==questionId).findFirst()
        .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST,"Question does not belong to this exam."));
    if (selected!=null && !q.options().contains(selected)) throw new ResponseStatusException(BAD_REQUEST,"Choose one of the listed options.");
    if (selected==null) a.getAnswers().remove(questionId); else a.getAnswers().put(questionId,selected);
    return Map.of("message","Answer saved.","answered",a.getAnswers().size());
  }
  public Map<String,Object> position(String id,String email,int index) {
    var a=owned(id,email,true); active(a);
    if (index<0 || index>=definition(a).questions().size()) throw new ResponseStatusException(BAD_REQUEST,"Invalid question position.");
    a.setCurrentQuestion(index); return Map.of("currentQuestion",index);
  }
  public Map<String,Object> submit(String id,String email) {
    var a=owned(id,email,true); active(a);
    var result=ExamScoring.calculate(a.getId(),definition(a),a.getAnswers());
    a.setStatus("SUBMITTED"); a.setSubmittedAt(Instant.now());
    result.put("attemptNumber",a.getAttemptNumber()); result.put("startedAt",a.getStartedAt());
    result.put("submittedAt",a.getSubmittedAt()); a.setResultJson(json(result)); return result;
  }
  @Transactional(readOnly=true)
  public Map<String,Object> result(String id,String email) {
    var a=owned(id,email,false); submitted(a); return savedResult(a);
  }
  @Transactional(readOnly=true)
  public Map<String,Object> review(String id,String email) {
    var a=owned(id,email,false); submitted(a); return reviewData(a);
  }
  private Map<String,Object> reviewData(ExamAttempt a) {
    var exam=definition(a);
    var rows=exam.questions().stream().map(q -> {
      var row=new LinkedHashMap<String,Object>(); String selected=a.getAnswers().get(q.id());
      row.put("id",q.id()); row.put("question",q.question()); row.put("options",q.options());
      row.put("selectedAnswer",selected); row.put("correctAnswer",q.answer());
      row.put("status",selected==null ? "UNANSWERED" : selected.equals(q.answer()) ? "CORRECT" : "INCORRECT");
      row.put("marksObtained",ExamScoring.marks(exam,q,selected)); return row;
    }).toList();
    return Map.of("attemptId",a.getId(),"title",exam.title(),"questions",rows);
  }
  @Transactional(readOnly=true)
  public List<Map<String,Object>> history(String email) {
    var seen=new HashSet<String>();
    return attempts.findByUserIdOrderByStartedAtDesc(user(email).getId()).stream().sorted(Comparator.comparingInt(ExamAttempt::getAttemptNumber).reversed()).filter(a -> seen.add(a.getExamId())).map(this::summary).toList();
  }
  @Transactional(readOnly=true)
  public List<Map<String,Object>> adminResults() {
    var profiles=new HashMap<String,Learner>(); users.findAll().forEach(u -> profiles.put(u.getId(),u));
    return attempts.findAllByOrderByStartedAtDesc().stream().map(a -> {
      var row=summary(a); var u=profiles.get(a.getUserId());
      row.put("name",u.getName()); row.put("username",u.getUsername()); return row;
    }).toList();
  }
  @Transactional(readOnly=true)
  public Map<String,Object> adminAttempt(String id) {
    var a=attempts.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND,"Attempt not found."));
    var out=summary(a); out.put("answers",new TreeMap<>(a.getAnswers()));
    if (a.getStatus().equals("SUBMITTED")) out.put("review",reviewData(a));
    return out;
  }
  private Map<String,Object> summary(ExamAttempt a) {
      var row=new LinkedHashMap<String,Object>(); row.put("attemptId",a.getId()); row.put("examId",a.getExamId());
      row.put("title",a.getTitle()); row.put("status",a.getStatus()); row.put("startedAt",a.getStartedAt());
      row.put("attemptNumber",a.getAttemptNumber()); row.put("studentName",a.getStudentName());
      row.put("submittedAt",a.getSubmittedAt()); row.put("userId",a.getUserId());
      if (a.getStatus().equals("SUBMITTED")) row.put("result",savedResult(a)); return row;
  }
}
