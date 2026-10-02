package com.example.application.exam;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
  public record AnswerRequest(@NotNull @Positive Integer questionId, @Size(max=500) String selectedAnswer) {}
  public record PositionRequest(@NotNull @Min(0) Integer currentQuestion) {}
  private final ExamCatalog catalog;
  private final ExamService service;
  public ExamController(ExamCatalog catalog,ExamService service) { this.catalog=catalog; this.service=service; }
  @GetMapping public Object list() { return catalog.all().stream().map(ExamCatalog::summary).toList(); }
  @GetMapping("/{examId}") public Object exam(@PathVariable String examId) { return ExamCatalog.safe(catalog.get(examId)); }
  @PostMapping("/{examId}/start") public Object start(@PathVariable String examId,Principal p) { return service.start(examId,p.getName()); }
  @GetMapping("/attempts") public Object history(Principal p) { return service.history(p.getName()); }
  @GetMapping("/attempts/{id}") public Object attempt(@PathVariable String id,Principal p) { return service.attempt(id,p.getName()); }
  @PostMapping("/attempts/{id}/answers") public Object answer(@PathVariable String id,@Valid @RequestBody AnswerRequest body,Principal p) {
    return service.answer(id,p.getName(),body.questionId(),body.selectedAnswer());
  }
  @PostMapping("/attempts/{id}/position") public Object position(@PathVariable String id,@Valid @RequestBody PositionRequest body,Principal p) {
    return service.position(id,p.getName(),body.currentQuestion());
  }
  @PostMapping("/attempts/{id}/submit") public Object submit(@PathVariable String id,Principal p) { return service.submit(id,p.getName()); }
  @GetMapping("/attempts/{id}/result") public Object result(@PathVariable String id,Principal p) { return service.result(id,p.getName()); }
  @GetMapping("/attempts/{id}/review") public Object review(@PathVariable String id,Principal p) { return service.review(id,p.getName()); }
}
