package com.example.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "content_lock")
public class ContentLock {
  @Id private Integer id;

  public Integer getId() {
    return id;
  }

  public void setId(Integer value) {
    this.id = value;
  }
}
