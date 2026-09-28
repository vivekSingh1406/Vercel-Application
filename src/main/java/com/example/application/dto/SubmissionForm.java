package com.example.application.dto;

import jakarta.validation.constraints.*;

public class SubmissionForm {
  @NotBlank(message = "Your name is required.")
  @Size(max = 80, message = "Your name is too long.")
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String value) {
    name = value;
  }

  @NotBlank(message = "The title is required.")
  @Size(min = 5, max = 140, message = "The title needs 5 to 140 characters.")
  private String title;

  public String getTitle() {
    return title;
  }

  public void setTitle(String value) {
    title = value;
  }

  @NotBlank(message = "Your story is required.")
  @Size(min = 80, max = 6000, message = "Your story needs 80 to 6000 characters.")
  private String content;

  public String getContent() {
    return content;
  }

  public void setContent(String value) {
    content = value;
  }
}
