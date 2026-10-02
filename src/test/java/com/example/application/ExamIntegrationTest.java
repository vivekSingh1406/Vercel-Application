package com.example.application;

import com.example.application.exam.*;
import com.fasterxml.jackson.databind.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;
import org.springframework.transaction.annotation.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class ExamIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper mapper;
  @Autowired LearnerRepository users;
  @Autowired ExamCatalog catalog;
  @Autowired PasswordEncoder encoder;
  @Autowired ExamService service;
  @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
  private static final String PASSWORD="StrongPassword123";
  private String email() { return UUID.randomUUID()+"@example.test"; }
  private ResultActions postJson(String path,Object value,MockHttpSession session) throws Exception {
    var req=post(path).with(csrf()).contentType("application/json").content(mapper.writeValueAsString(value));
    if(session!=null) req.session(session); return mvc.perform(req);
  }
  private JsonNode body(ResultActions response) throws Exception { return mapper.readTree(response.andReturn().getResponse().getContentAsString()); }
  private ResultActions signup(String email,String password,String confirmation) throws Exception {
    return mvc.perform(post("/admin/exam-center/api/students").with(csrf())
        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN"))
        .contentType("application/json").content(mapper.writeValueAsString(Map.of("name","Learner","username",email,"email",email,"password",password,"active",true))));
  }
  private MockHttpSession login(String email) throws Exception {
    return (MockHttpSession)postJson("/api/auth/login",Map.of("email",email,"password",PASSWORD),null)
        .andExpect(status().isOk()).andReturn().getRequest().getSession(false);
  }
  private MockHttpSession account() throws Exception { String email=email(); signup(email,PASSWORD,PASSWORD).andExpect(status().isCreated()); return login(email); }
  private String start(MockHttpSession session) throws Exception {
    return body(postJson("/api/exams/general-knowledge/start",Map.of(),session).andExpect(status().isOk())).get("attemptId").asText();
  }
  @Test void signupHashesPasswordNormalizesEmailAndNeverReturnsSecrets() throws Exception {
    String email=email();
    var result=signup(email.toUpperCase(Locale.ROOT),PASSWORD,PASSWORD).andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value(email)).andExpect(jsonPath("$.password").doesNotExist()).andExpect(jsonPath("$.passwordHash").doesNotExist());
    assertThat(result.andReturn().getResponse().getContentAsString()).doesNotContain(PASSWORD,"{bcrypt}");
    var user=users.findByEmail(email).orElseThrow();
    assertThat(user.getPasswordHash()).startsWith("{bcrypt}").isNotEqualTo(PASSWORD);
    assertThat(encoder.matches(PASSWORD,user.getPasswordHash())).isTrue();
    signup(email,PASSWORD,PASSWORD).andExpect(status().isConflict());
  }
  @Test void invalidSignupAndLoginRequestsAreRejected() throws Exception {
    signup("not-email",PASSWORD,PASSWORD).andExpect(status().isBadRequest());
    signup(email(),"weak","weak").andExpect(status().isBadRequest());

    postJson("/api/auth/signup",Map.of(),null).andExpect(status().isUnauthorized());
    signup(email(),"Aa1"+"é".repeat(40),"Aa1"+"é".repeat(40)).andExpect(status().isBadRequest());
    postJson("/api/auth/login",Map.of("email","bad","password",PASSWORD),null).andExpect(status().isUnauthorized());
    postJson("/api/auth/login",Map.of("email",email(),"password",PASSWORD),null).andExpect(status().isUnauthorized());
    String email=email(); signup(email,PASSWORD,PASSWORD);
    postJson("/api/auth/login",Map.of("email",email,"password","wrong"),null).andExpect(status().isUnauthorized());
  }
  @Test void loginPersistsSessionAndLogoutRevokesIt() throws Exception {
    var session=account();
    mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.user.name").value("Learner"));
    mvc.perform(get("/exam-center").session(session)).andExpect(status().isOk());
    postJson("/api/auth/logout",Map.of(),session).andExpect(status().isOk());
    assertThat(session.isInvalid()).isTrue();
    mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
  }
  @Test void cachedAdminBasicHeaderCannotReplaceLearnerSession() throws Exception {
    var session=account();
    mvc.perform(get("/api/auth/me").session(session)
        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin", "cached-password")))
        .andExpect(status().isOk()).andExpect(jsonPath("$.user.name").value("Learner"));
    mvc.perform(get("/login")
        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin", "cached-password")))
        .andExpect(status().isOk());
  }
  @Test void loginRotatesExistingSessionId() throws Exception {
    String email=email(); signup(email,PASSWORD,PASSWORD);
    var previous=new MockHttpSession(); String oldId=previous.getId();
    var response=postJson("/api/auth/login",Map.of("email",email,"password",PASSWORD),previous).andExpect(status().isOk());
    assertThat(response.andReturn().getRequest().getSession(false).getId()).isNotEqualTo(oldId);
  }
  @Test void privateQuestionResourceIsNotServedAsAStaticAsset() throws Exception {
    mvc.perform(get("/exams/general-knowledge.json")).andExpect(status().isNotFound());
  }
  @Test void anonymousAccessAndCsrfBypassAreRejected() throws Exception {
    mvc.perform(get("/exam-center")).andExpect(status().is3xxRedirection());
    for(String path : List.of("/api/exams","/api/exams/general-knowledge","/api/exams/attempts","/api/exams/attempts/nope/result","/api/exams/attempts/nope/review"))
      mvc.perform(get(path)).andExpect(status().isUnauthorized());
    mvc.perform(post("/api/exams/general-knowledge/start")).andExpect(status().isUnauthorized());
    postJson("/api/exams/general-knowledge/start",Map.of(),null).andExpect(status().isUnauthorized());
    mvc.perform(post("/api/auth/signup").contentType("application/json").content("{}")).andExpect(status().isForbidden());
    mvc.perform(post("/api/exams/general-knowledge/start").session(account())).andExpect(status().isForbidden());
  }
  @Test void catalogLoadsOneHundredQuestionsWithoutAnswers() throws Exception {
    var session=account();
    var response=body(mvc.perform(get("/api/exams/general-knowledge").session(session)).andExpect(status().isOk()));
    assertThat(response.get("questions").size()).isEqualTo(100);
    response.get("questions").forEach(q -> { assertThat(q.has("answer")).isFalse(); assertThat(q.has("correctAnswer")).isFalse(); assertThat(q.get("options").size()).isEqualTo(4); });
    assertThat(response.get("totalQuestions").asInt()).isEqualTo(100);
    mvc.perform(get("/api/exams/unknown").session(session)).andExpect(status().isNotFound());
  }
  @Test void answersAndPositionPersistAndStartResumes() throws Exception {
    var session=account(); String id=start(session); assertThat(start(session)).isEqualTo(id);
    var q=catalog.get("general-knowledge").questions().get(0);
    postJson("/api/exams/attempts/"+id+"/answers",Map.of("questionId",q.id(),"selectedAnswer",q.options().get(0)),session).andExpect(status().isOk());
    postJson("/api/exams/attempts/"+id+"/answers",Map.of("questionId",q.id(),"selectedAnswer",q.options().get(1)),session).andExpect(status().isOk());
    postJson("/api/exams/attempts/"+id+"/position",Map.of("currentQuestion",24),session).andExpect(status().isOk());
    mvc.perform(get("/api/exams/attempts/"+id).session(session)).andExpect(status().isOk())
        .andExpect(jsonPath("$.currentQuestion").value(24)).andExpect(jsonPath("$.answers.1").value(q.options().get(1)))
        .andExpect(jsonPath("$.questions[0].answer").doesNotExist());
    var clear=new HashMap<String,Object>(); clear.put("questionId",q.id()); clear.put("selectedAnswer",null);
    postJson("/api/exams/attempts/"+id+"/answers",clear,session).andExpect(status().isOk());
    mvc.perform(get("/api/exams/attempts/"+id).session(session)).andExpect(jsonPath("$.answers").isEmpty());
  }
  @Test void invalidQuestionsOptionsAndPositionsAreRejected() throws Exception {
    var session=account(); String path="/api/exams/attempts/"+start(session);
    postJson(path+"/answers",Map.of("questionId",9999,"selectedAnswer","bad"),session).andExpect(status().isBadRequest());
    postJson(path+"/answers",Map.of("questionId",1,"selectedAnswer","bad"),session).andExpect(status().isBadRequest());
    postJson(path+"/answers",Map.of("selectedAnswer","Paris"),session).andExpect(status().isBadRequest());
    postJson(path+"/position",Map.of("currentQuestion",100),session).andExpect(status().isBadRequest());
    postJson(path+"/position",Map.of("currentQuestion",-1),session).andExpect(status().isBadRequest());
    mvc.perform(post(path+"/answers").session(session).with(csrf()).contentType("application/json").content("bad json")).andExpect(status().isBadRequest());
  }
  @Test void crossUserAttemptResultReviewAndMutationsAreDenied() throws Exception {
    var owner=account(); var other=account(); String id=start(owner),path="/api/exams/attempts/"+id;
    for(String suffix : List.of("","/result","/review")) mvc.perform(get(path+suffix).session(other)).andExpect(status().isNotFound());
    postJson(path+"/answers",Map.of("questionId",1,"selectedAnswer","Paris"),other).andExpect(status().isNotFound());
    postJson(path+"/position",Map.of("currentQuestion",1),other).andExpect(status().isNotFound());
    postJson(path+"/submit",Map.of(),other).andExpect(status().isNotFound());
    postJson(path+"/submit",Map.of(),owner).andExpect(status().isOk());
    mvc.perform(get(path+"/result").session(other)).andExpect(status().isNotFound());
    mvc.perform(get(path+"/review").session(other)).andExpect(status().isNotFound());
    mvc.perform(get("/api/exams/attempts").session(other)).andExpect(jsonPath("$.length()").value(0));
  }
  @Test void trustedMixedScoreReviewAndCompletedAttemptImmutability() throws Exception {
    var session=account(); String id=start(session),path="/api/exams/attempts/"+id;
    mvc.perform(get(path+"/result").session(session)).andExpect(status().isConflict());
    mvc.perform(get(path+"/review").session(session)).andExpect(status().isConflict());
    var qs=catalog.get("general-knowledge").questions();
    postJson(path+"/answers",Map.of("questionId",1,"selectedAnswer",qs.get(0).answer(),"marks",999,"isCorrect",false),session).andExpect(status().isOk());
    String wrong=qs.get(1).options().stream().filter(o -> !o.equals(qs.get(1).answer())).findFirst().orElseThrow();
    postJson(path+"/answers",Map.of("questionId",2,"selectedAnswer",wrong,"marks",999,"isCorrect",true),session).andExpect(status().isOk());
    postJson(path+"/submit",Map.of("correct",100,"obtainedMarks",100),session).andExpect(status().isOk())
        .andExpect(jsonPath("$.correct").value(1)).andExpect(jsonPath("$.incorrect").value(1))
        .andExpect(jsonPath("$.attempted").value(2)).andExpect(jsonPath("$.unanswered").value(98))
        .andExpect(jsonPath("$.obtainedMarks").value(1)).andExpect(jsonPath("$.percentage").value(1));
    mvc.perform(get(path+"/result").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.obtainedMarks").value(1));
    mvc.perform(get(path+"/review").session(session)).andExpect(status().isOk())
        .andExpect(jsonPath("$.questions[0].correctAnswer").value(qs.get(0).answer()))
        .andExpect(jsonPath("$.questions[0].status").value("CORRECT"))
        .andExpect(jsonPath("$.questions[1].status").value("INCORRECT"))
        .andExpect(jsonPath("$.questions[2].status").value("UNANSWERED"));
    postJson(path+"/submit",Map.of(),session).andExpect(status().isConflict());
    postJson(path+"/answers",Map.of("questionId",3,"selectedAnswer",qs.get(2).answer()),session).andExpect(status().isConflict());
    postJson(path+"/position",Map.of("currentQuestion",4),session).andExpect(status().isConflict());
    mvc.perform(get("/api/exams/attempts").session(session)).andExpect(jsonPath("$[0].result.obtainedMarks").value(1));
    assertThat(start(session)).isNotEqualTo(id);
  }

  @Test void adminCreatedStudentRetakesAndOnlyLatestIsAccessible() throws Exception {
    String email=email();signup(email,PASSWORD,PASSWORD).andExpect(status().isCreated());
    var session=login(email);String first=start(session);
    postJson("/api/exams/attempts/"+first+"/submit",Map.of(),session).andExpect(status().isOk());
    String second=start(session);
    for(String suffix:List.of("","/result","/review"))
      mvc.perform(get("/api/exams/attempts/"+first+suffix).session(session)).andExpect(status().isNotFound());
    postJson("/api/exams/attempts/"+second+"/submit",Map.of(),session).andExpect(status().isOk()).andExpect(jsonPath("$.attemptNumber").value(2));
    mvc.perform(get("/api/exams/attempts").session(session)).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].attemptId").value(second));
    for(String path:List.of("/admin","/admin/exam-center/students","/admin/exam-center/api/students","/admin/exam-center/api/results"))
      mvc.perform(get(path).session(session)).andExpect(status().isForbidden());
    String uid=users.findByEmail(email).orElseThrow().getId();
    mvc.perform(get("/admin/exam-center/api/students/"+uid).with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN")))
      .andExpect(status().isOk()).andExpect(jsonPath("$.attempts.length()").value(2)).andExpect(jsonPath("$.student.passwordHash").doesNotExist());
    mvc.perform(get("/admin/exam-center/api/results/"+first).with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN")))
      .andExpect(status().isOk()).andExpect(jsonPath("$.review.questions.length()").value(100));
    mvc.perform(delete("/admin/exam-center/api/students/"+uid).with(csrf()).with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN"))).andExpect(status().isOk());
    mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/exams/attempts/"+second+"/result").session(session)).andExpect(status().isUnauthorized());
    postJson("/api/auth/login",Map.of("username",email,"password",PASSWORD),null).andExpect(status().isUnauthorized());
  }

  @Test void usernameLoginProfileEditingAndPasswordReset() throws Exception {
    String username="student-"+UUID.randomUUID();
    var admin=org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN");
    var created=body(mvc.perform(post("/admin/exam-center/api/students").with(admin).with(csrf()).contentType("application/json")
      .content(mapper.writeValueAsString(Map.of("name","Rahul","username",username,"password",PASSWORD,"active",true)))).andExpect(status().isCreated()));
    String id=created.get("id").asText();
    var session=(MockHttpSession)postJson("/api/auth/login",Map.of("username",username,"password",PASSWORD),null).andExpect(status().isOk()).andReturn().getRequest().getSession(false);
    String attempt=start(session);
    mvc.perform(put("/admin/exam-center/api/students/"+id).with(admin).with(csrf()).contentType("application/json")
      .content(mapper.writeValueAsString(Map.of("name","Rahul Updated","username",username+"-new","password","ResetPassword123","active",true)))).andExpect(status().isOk());
    mvc.perform(get("/api/exams/attempts/"+attempt).session(session)).andExpect(status().isOk());
    postJson("/api/auth/login",Map.of("username",username,"password",PASSWORD),null).andExpect(status().isUnauthorized());
    postJson("/api/auth/login",Map.of("username",username+"-new","password","ResetPassword123"),null).andExpect(status().isOk());
    mvc.perform(get("/admin/exam-center/api/students/"+id).with(admin)).andExpect(jsonPath("$.student.name").value("Rahul Updated"))
      .andExpect(jsonPath("$.attempts[0].studentName").value("Rahul"));
  }
  @Test void submitUnansweredExam() throws Exception {
    var session=account(); String id=start(session);
    postJson("/api/exams/attempts/"+id+"/submit",Map.of(),session).andExpect(status().isOk())
        .andExpect(jsonPath("$.unanswered").value(100)).andExpect(jsonPath("$.obtainedMarks").value(0));
  }
  @Test @Transactional(propagation=Propagation.NOT_SUPPORTED)
  void concurrentStartAndSubmissionAreSerialized() throws Exception {
    String email=email(); signup(email,PASSWORD,PASSWORD).andExpect(status().isCreated());
    String userId=users.findByEmail(email).orElseThrow().getId();
    var pool=Executors.newFixedThreadPool(2);
    try {
      var gate=new CountDownLatch(1);
      Callable<String> start=() -> { gate.await(); return service.start("general-knowledge",email).get("attemptId").toString(); };
      var first=pool.submit(start); var second=pool.submit(start); gate.countDown();
      String id=first.get(15,TimeUnit.SECONDS); assertThat(second.get(15,TimeUnit.SECONDS)).isEqualTo(id);
      var submitGate=new CountDownLatch(1);
      Callable<Integer> submit=() -> {
        submitGate.await();
        try { service.submit(id,email); return 200; }
        catch(org.springframework.web.server.ResponseStatusException e) { return e.getStatusCode().value(); }
      };
      var s1=pool.submit(submit); var s2=pool.submit(submit); submitGate.countDown();
      assertThat(List.of(s1.get(15,TimeUnit.SECONDS),s2.get(15,TimeUnit.SECONDS))).containsExactlyInAnyOrder(200,409);
    } finally {
      pool.shutdownNow();
      jdbc.update("delete from exam_answer where attempt_id in (select id from exam_attempt where user_id=?)",userId);
      jdbc.update("delete from exam_attempt where user_id=?",userId); users.deleteById(userId);
    }
  }
}
