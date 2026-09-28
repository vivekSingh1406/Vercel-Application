package com.example.application.repository;

import com.example.application.entity.ContentLock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentLockRepository extends JpaRepository<ContentLock, Integer> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select l from ContentLock l where l.id=1")
  ContentLock acquire();
}
