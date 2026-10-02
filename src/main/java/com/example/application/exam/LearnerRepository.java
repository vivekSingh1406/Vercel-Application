package com.example.application.exam;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;

public interface LearnerRepository extends JpaRepository<Learner, String> {
  Optional<Learner> findByUsername(String username);
  Optional<Learner> findByEmail(String email);
  boolean existsByEmail(String email);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select u from Learner u where u.id = :id")
  Optional<Learner> lockById(String id);
}
