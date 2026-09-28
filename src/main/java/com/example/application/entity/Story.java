package com.example.application.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "story")
public class Story {
  @Column(nullable = false)
  private boolean dateOnly;

  public boolean isDateOnly() {
    return dateOnly;
  }

  public void setDateOnly(boolean value) {
    dateOnly = value;
  }

  @Id
  @Column(length = 64)
  private String id;

  public String getId() {
    return id;
  }

  public void setId(String value) {
    this.id = value;
  }

  @Column(nullable = false, length = 140)
  private String title;

  public String getTitle() {
    return title;
  }

  public void setTitle(String value) {
    this.title = value;
  }

  @Column(nullable = false, length = 512)
  private String slug;

  public String getSlug() {
    return slug;
  }

  public void setSlug(String value) {
    this.slug = value;
  }

  @Column(nullable = false, length = 300)
  private String excerpt;

  public String getExcerpt() {
    return excerpt;
  }

  public void setExcerpt(String value) {
    this.excerpt = value;
  }

  @Column(nullable = false, columnDefinition = "text")
  private String content;

  public String getContent() {
    return content;
  }

  public void setContent(String value) {
    this.content = value;
  }

  @Column(nullable = false, length = 80)
  private String author;

  public String getAuthor() {
    return author;
  }

  public void setAuthor(String value) {
    this.author = value;
  }

  @Column(length = 4096)
  private String image;

  public String getImage() {
    return image;
  }

  public void setImage(String value) {
    this.image = value;
  }

  @Column(length = 255)
  private String imageName;

  public String getImageName() {
    return imageName;
  }

  public void setImageName(String value) {
    this.imageName = value;
  }

  @Column(length = 255)
  private String category;

  public String getCategory() {
    return category;
  }

  public void setCategory(String value) {
    this.category = value;
  }

  @Column(nullable = false)
  private java.time.Instant createdAt;

  public java.time.Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(java.time.Instant value) {
    this.createdAt = value;
  }

  @Column(nullable = false, length = 16)
  private String status;

  public String getStatus() {
    return status;
  }

  public void setStatus(String value) {
    this.status = value;
  }

  @Column(unique = true, length = 512)
  private String publishedSlug;

  public String getPublishedSlug() {
    return publishedSlug;
  }

  public void setPublishedSlug(String value) {
    this.publishedSlug = value;
  }

  @Version private Long version;

  public Long getVersion() {
    return version;
  }

  public void setVersion(Long value) {
    this.version = value;
  }
}
