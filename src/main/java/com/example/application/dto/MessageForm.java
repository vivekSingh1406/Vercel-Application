package com.example.application.dto;

import jakarta.validation.constraints.*;

public class MessageForm {
  private String id;

  public String getId() {
    return id;
  }

  public void setId(String value) {
    id = value;
  }

  private Long version;

  public Long getVersion() {
    return version;
  }

  public void setVersion(Long value) {
    version = value;
  }

  @NotBlank(message = "Your name is required.")
  @Size(max = 80, message = "Your name is too long.")
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String value) {
    name = value;
  }

  @NotBlank(message = "Your message is required.")
  @Size(min = 5, max = 600, message = "Your message needs 5 to 600 characters.")
  private String message;

  public String getMessage() {
    return message;
  }

  public void setMessage(String value) {
    message = value;
  }
}
