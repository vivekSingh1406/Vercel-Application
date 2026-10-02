package com.example.application.exam;

import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Same message/errors contract as the existing content API. */
@RestControllerAdvice(assignableTypes={AuthController.class,ExamController.class,ExamAdminController.class})
public class ExamApiExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
    Map<String,String> errors=new LinkedHashMap<>();
    e.getBindingResult().getFieldErrors().forEach(f -> errors.putIfAbsent(f.getField(),f.getDefaultMessage()));
    return ResponseEntity.badRequest().body(Map.of("message","Please check the highlighted fields.","errors",errors));
  }
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<?> status(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",Objects.requireNonNullElse(e.getReason(),"Request failed.")));
  }
  @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
  public ResponseEntity<?> invalid() { return ResponseEntity.badRequest().body(Map.of("message","Invalid request. Check the supplied fields.")); }
  @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
  public ResponseEntity<?> conflict() { return ResponseEntity.status(409).body(Map.of("message","This account or record already exists. Reload and try again.")); }
  @ExceptionHandler(org.springframework.dao.PessimisticLockingFailureException.class)
  public ResponseEntity<?> busy() { return ResponseEntity.status(409).body(Map.of("message","Another request is updating this attempt. Please try again.")); }
  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> failure(Exception e) {
    org.slf4j.LoggerFactory.getLogger(getClass()).error("Exam operation failed",e);
    return ResponseEntity.internalServerError().body(Map.of("message","We could not complete the request. Please try again."));
  }
}
