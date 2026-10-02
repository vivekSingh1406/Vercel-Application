package com.example.application.exam;

import java.util.*;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, String> {
  Optional<ExamAttempt> findFirstByUserIdAndExamIdOrderByAttemptNumberDesc(String userId,String examId);
  List<ExamAttempt> findAllByOrderByStartedAtDesc();
  List<ExamAttempt> findByUserIdOrderByStartedAtDesc(String userId);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  Optional<ExamAttempt> findFirstByUserIdAndExamIdAndStatus(String userId, String examId, String status);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select a from ExamAttempt a where a.id = :id")
  Optional<ExamAttempt> lockById(String id);
}
