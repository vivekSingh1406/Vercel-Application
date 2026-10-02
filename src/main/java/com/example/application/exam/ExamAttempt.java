package com.example.application.exam;

import jakarta.persistence.*;

@Entity
@Table(name="exam_attempt", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","exam_id","attempt_number"}))
public class ExamAttempt {
  @Id @Column(length=36)
  private String id;
  @Column(nullable=false)
  private int attemptNumber;
  public int getAttemptNumber() { return attemptNumber; }
  public void setAttemptNumber(int value) { attemptNumber=value; }
  @Column(nullable=false, length=80)
  private String studentName;
  public String getStudentName() { return studentName; }
  public void setStudentName(String value) { studentName=value; }
  public String getId() { return id; }
  public void setId(String value) { id = value; }
  @Column(nullable=false, length=36)
  private String userId;
  public String getUserId() { return userId; }
  public void setUserId(String value) { userId = value; }
  @Column(nullable=false, length=80)
  private String examId;
  public String getExamId() { return examId; }
  public void setExamId(String value) { examId = value; }
  @Column(nullable=false, length=200)
  private String title;
  public String getTitle() { return title; }
  public void setTitle(String value) { title = value; }
  @Column(nullable=false, length=16)
  private String status;
  public String getStatus() { return status; }
  public void setStatus(String value) { status = value; }
  @Column(nullable=false)
  private java.time.Instant startedAt;
  public java.time.Instant getStartedAt() { return startedAt; }
  public void setStartedAt(java.time.Instant value) { startedAt = value; }
  
  private java.time.Instant submittedAt;
  public java.time.Instant getSubmittedAt() { return submittedAt; }
  public void setSubmittedAt(java.time.Instant value) { submittedAt = value; }
  @Column(nullable=false)
  private int currentQuestion;
  public int getCurrentQuestion() { return currentQuestion; }
  public void setCurrentQuestion(int value) { currentQuestion = value; }
  @com.fasterxml.jackson.annotation.JsonIgnore @Column(nullable=false, columnDefinition="longtext")
  private String snapshot;
  public String getSnapshot() { return snapshot; }
  public void setSnapshot(String value) { snapshot = value; }
  @com.fasterxml.jackson.annotation.JsonIgnore @Column(columnDefinition="text")
  private String resultJson;
  public String getResultJson() { return resultJson; }
  public void setResultJson(String value) { resultJson = value; }
  @ElementCollection
  @CollectionTable(name="exam_answer", joinColumns=@JoinColumn(name="attempt_id"))
  @MapKeyColumn(name="question_id")
  @Column(name="selected_answer", nullable=false, length=500)
  private java.util.Map<Integer, String> answers = new java.util.HashMap<>();
  public java.util.Map<Integer, String> getAnswers() { return answers; }
}
