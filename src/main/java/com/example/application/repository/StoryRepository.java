package com.example.application.repository;

import com.example.application.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryRepository extends JpaRepository<Story, String> {
  java.util.List<Story> findByStatusOrderByCreatedAtDescIdAsc(String status);

  java.util.Optional<Story> findByPublishedSlug(String slug);

  boolean existsByPublishedSlugAndIdNot(String slug, String id);
}
