package com.example.application.exception;

public class ContentException extends RuntimeException {
  private final String field;

  public ContentException(String field, String message) {
    super(message);
    this.field = field;
  }

  public String getField() {
    return field;
  }
}
