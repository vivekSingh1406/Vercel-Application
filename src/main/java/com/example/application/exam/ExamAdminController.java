package com.example.application.exam;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/admin/exam-center/api")
@Transactional
public class ExamAdminController {
  public record StudentRequest(@NotBlank @Size(max=80) String name,
      @NotBlank @Pattern(regexp="[a-zA-Z0-9][a-zA-Z0-9._@+-]{2,253}") String username,
      @Email @Size(max=254) String email, @Size(max=64) String password, boolean active) {}
  private final LearnerRepository users;
  private final PasswordEncoder encoder;
  private final ExamService exams;
  private final ExamCatalog catalog;
  private final String admin;
  public ExamAdminController(LearnerRepository users,PasswordEncoder encoder,ExamService exams,ExamCatalog catalog,
      @Value("${app.admin-username}") String admin) {
    this.users=users; this.encoder=encoder; this.exams=exams; this.catalog=catalog; this.admin=admin;
  }
  private Learner student(String id) {
    return users.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND,"Student not found."));
  }
  @GetMapping("/students") public Object students() { return users.findAll(); }
  @GetMapping("/students/{id}") public Object profile(@PathVariable String id) {
    return Map.of("student",student(id),"attempts",exams.adminResults().stream().filter(r -> r.get("userId").equals(id)).toList());
  }
  @PostMapping("/students") @ResponseStatus(CREATED)
  public Object create(@Valid @RequestBody StudentRequest body) {
    var u=new Learner(); u.setId(UUID.randomUUID().toString()); u.setCreatedAt(Instant.now());
    return save(u,body,true);
  }
  @PutMapping("/students/{id}") public Object update(@PathVariable String id,@Valid @RequestBody StudentRequest body) {
    return save(student(id),body,false);
  }
  // Deactivation preserves the student's exam records and blocks existing sessions as well as new logins.
  @DeleteMapping("/students/{id}") public Object deactivate(@PathVariable String id) {
    var u=student(id); u.setActive(false); return u;
  }
  private Learner save(Learner u,StudentRequest b,boolean creating) {
    String username=b.username().strip().toLowerCase(Locale.ROOT);
    String email=b.email()==null || b.email().isBlank() ? null : b.email().strip().toLowerCase(Locale.ROOT);
    if (username.equalsIgnoreCase(admin) || users.findByUsername(username).filter(other -> !other.getId().equals(u.getId())).isPresent())
      throw new ResponseStatusException(CONFLICT,"Username is already in use.");
    if (email!=null && users.findByEmail(email).filter(other -> !other.getId().equals(u.getId())).isPresent())
      throw new ResponseStatusException(CONFLICT,"Email is already in use.");
    if (creating || (b.password()!=null && !b.password().isEmpty())) {
      String password=b.password();
      if (password==null || password.length()<10 || !password.matches("(?s)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*") || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)
        throw new ResponseStatusException(BAD_REQUEST,"Password needs 10–64 characters, uppercase, lowercase and a number (maximum 72 UTF-8 bytes).");
      u.setPasswordHash(encoder.encode(password));
    }
    u.setName(b.name().strip()); u.setUsername(username); u.setEmail(email); u.setActive(b.active());
    return users.saveAndFlush(u);
  }
  @GetMapping("/exams") public Object catalog() { return catalog.all().stream().map(ExamCatalog::summary).toList(); }
  @GetMapping("/results") public Object results() { return exams.adminResults(); }
  @GetMapping("/results/{id}") public Object attempt(@PathVariable String id) { return exams.adminAttempt(id); }
}
