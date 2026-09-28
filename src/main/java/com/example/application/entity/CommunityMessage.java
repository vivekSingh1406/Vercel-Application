package com.example.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "community_message")
public class CommunityMessage {
  @Id
  @Column(length = 64)
  private String id;

  public String getId() {
    return id;
  }

  public void setId(String value) {
    this.id = value;
  }

  @Column(nullable = false, length = 600)
  private String message;

  public String getMessage() {
    return message;
  }

  public void setMessage(String value) {
    this.message = value;
  }

  @Column(nullable = false, length = 80)
  private String authorOfMessage;

  public String getAuthorOfMessage() {
    return authorOfMessage;
  }

  public void setAuthorOfMessage(String value) {
    this.authorOfMessage = value;
  }

  @Column(nullable = false)
  private java.time.Instant createdAt;

  public java.time.Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(java.time.Instant value) {
    this.createdAt = value;
  }

  @Version private Long version;

  public Long getVersion() {
    return version;
  }

  public void setVersion(Long value) {
    this.version = value;
  }
}
