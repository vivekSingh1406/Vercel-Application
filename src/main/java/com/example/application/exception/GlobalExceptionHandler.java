package com.example.application.exception;

import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice(assignableTypes = com.example.application.controller.ContentController.class)
public class GlobalExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
    Map<String, String> fields = new LinkedHashMap<>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(f -> fields.putIfAbsent(f.getField(), f.getDefaultMessage()));
    return ResponseEntity.badRequest()
        .body(Map.of("message", "Please check the highlighted fields.", "errors", fields));
  }

  @ExceptionHandler(ContentException.class)
  public ResponseEntity<?> content(ContentException e) {
    return ResponseEntity.badRequest()
        .body(Map.of("message", e.getMessage(), "errors", Map.of(e.getField(), e.getMessage())));
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<?> upload() {
    return ResponseEntity.status(413)
        .body(Map.of("message", "Choose a JPG, PNG, or WebP image smaller than 1.5 MB."));
  }

  @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
  public ResponseEntity<?> conflict() {
    return ResponseEntity.status(409)
        .body(
            Map.of(
                "message",
                "This content conflicts with an existing record. Reload and try again."));
  }

  @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
  public ResponseEntity<?> missing(org.springframework.web.server.ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode())
        .body(Map.of("message", "This item is no longer available. Reload the page."));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> failure(Exception e) {
    org.slf4j.LoggerFactory.getLogger(getClass()).error("Content operation failed", e);
    return ResponseEntity.internalServerError()
        .body(
            Map.of(
                "message",
                "Could not save your changes. Please try again. Your form has been kept."));
  }
}
