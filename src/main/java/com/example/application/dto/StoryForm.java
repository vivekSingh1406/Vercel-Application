package com.example.application.dto;

import jakarta.validation.constraints.*;

public class StoryForm {
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

  private String sourceDraft;

  public String getSourceDraft() {
    return sourceDraft;
  }

  public void setSourceDraft(String value) {
    sourceDraft = value;
  }

  @NotBlank(message = "Title is required.")
  @Size(min = 5, max = 140, message = "Title needs 5 to 140 characters.")
  private String title;

  public String getTitle() {
    return title;
  }

  public void setTitle(String value) {
    title = value;
  }

  @NotBlank(message = "Slug is required.")
  @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug is not valid.")
  @Size(max = 512)
  private String slug;

  public String getSlug() {
    return slug;
  }

  public void setSlug(String value) {
    slug = value;
  }

  @NotBlank(message = "Author is required.")
  @Size(max = 80, message = "Author is too long.")
  private String author;

  public String getAuthor() {
    return author;
  }

  public void setAuthor(String value) {
    author = value;
  }

  @NotBlank(message = "Introduction is required.")
  @Size(max = 300, message = "Introduction is too long.")
  private String excerpt;

  public String getExcerpt() {
    return excerpt;
  }

  public void setExcerpt(String value) {
    excerpt = value;
  }

  @NotBlank(message = "Story is required.")
  @Size(min = 80, max = 6000, message = "Story needs 80 to 6000 characters.")
  private String content;

  public String getContent() {
    return content;
  }

  public void setContent(String value) {
    content = value;
  }

  private String image;

  public String getImage() {
    return image;
  }

  public void setImage(String value) {
    image = value;
  }

  @Size(max = 255)
  private String category;

  public String getCategory() {
    return category;
  }

  public void setCategory(String value) {
    category = value;
  }
}
