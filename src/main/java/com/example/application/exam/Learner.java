package com.example.application.exam;

import jakarta.persistence.*;

@Entity
@Table(name="exam_user")
public class Learner {
  @Id @Column(length=36)
  private String id;
  @Column(nullable=false, unique=true, length=254)
  private String username;
  public String getUsername() { return username; }
  public void setUsername(String value) { username=value; }
  @Column(nullable=false)
  private boolean active=true;
  public boolean isActive() { return active; }
  public void setActive(boolean value) { active=value; }
  public String getId() { return id; }
  public void setId(String value) { id = value; }
  @Column(nullable=false, length=80)
  private String name;
  public String getName() { return name; }
  public void setName(String value) { name = value; }
  @Column(unique=true, length=254)
  private String email;
  public String getEmail() { return email; }
  public void setEmail(String value) { email = value; }
  @com.fasterxml.jackson.annotation.JsonIgnore @Column(nullable=false, length=100)
  private String passwordHash;
  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String value) { passwordHash = value; }
  @Column(nullable=false)
  private java.time.Instant createdAt;
  public java.time.Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(java.time.Instant value) { createdAt = value; }
}
