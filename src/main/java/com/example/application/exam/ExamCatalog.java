package com.example.application.exam;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.NOT_FOUND;

/** Server-only catalog. Controllers expose explicit safe projections, never these records. */
@Component
public class ExamCatalog {
  public record Question(int id, String question, List<String> options, String answer) {}
  public record Definition(String id, String title, BigDecimal marksPerQuestion,
      BigDecimal incorrectMarks, BigDecimal unansweredMarks, List<Question> questions) {}
  private final Definition definition;
  public ExamCatalog(ObjectMapper mapper, @Value("${app.exam.catalog:classpath:exams/general-knowledge.json}") Resource file) throws java.io.IOException {
    try (var input = file.getInputStream()) { definition = mapper.readValue(input, Definition.class); }
    validate(definition);
  }
  public Definition get(String id) {
    if (!definition.id().equals(id)) throw new ResponseStatusException(NOT_FOUND, "Exam not found.");
    return definition;
  }
  public List<Definition> all() { return List.of(definition); }
  static void validate(Definition d) {
    if (d.id()==null || !d.id().matches("[a-zA-Z0-9-]{1,80}") || d.title()==null || d.title().isBlank() || d.title().length()>200
        || d.marksPerQuestion()==null || d.marksPerQuestion().signum()<=0
        || d.incorrectMarks()==null || d.incorrectMarks().signum()>0
        || d.unansweredMarks()==null || d.unansweredMarks().signum()!=0
        || d.questions()==null || d.questions().isEmpty() || d.questions().size()>1000)
      throw new IllegalStateException("Invalid exam catalog or marking rules.");
    Set<Integer> ids = new HashSet<>();
    for (var q : d.questions()) {
      if (q.id()<=0 || !ids.add(q.id()) || q.question()==null || q.question().isBlank()
          || q.options()==null || q.options().size()<2 || new HashSet<>(q.options()).size()!=q.options().size()
          || q.options().stream().anyMatch(o -> o==null || o.isBlank() || o.length()>500)
          || q.answer()==null || !q.options().contains(q.answer()))
        throw new IllegalStateException("Invalid question in exam catalog: " + q.id());
    }
  }
  public static Map<String,Object> summary(Definition d) {
    return Map.of("id",d.id(),"title",d.title(),"totalQuestions",d.questions().size(),
        "marksPerQuestion",d.marksPerQuestion(),"incorrectMarks",d.incorrectMarks(),"unansweredMarks",d.unansweredMarks());
  }
  public static Map<String,Object> safe(Definition d) {
    var out = new LinkedHashMap<>(summary(d));
    out.put("questions", d.questions().stream().map(q -> Map.of("id",q.id(),"question",q.question(),"options",q.options())).toList());
    return out;
  }
}
