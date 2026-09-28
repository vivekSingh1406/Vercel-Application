package com.example.application.repository;

import com.example.application.entity.CommunityMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<CommunityMessage, String> {
  java.util.List<CommunityMessage> findAllByOrderByCreatedAtDescIdAsc();
}
