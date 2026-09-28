package com.example.application.service;

import com.example.application.dto.*;
import com.example.application.entity.*;
import java.util.*;
import org.springframework.web.multipart.MultipartFile;

public interface ContentService {
  List<Map<String, Object>> stories();

  List<Map<String, Object>> drafts();

  List<Map<String, Object>> messages();

  Map<String, Object> story(String slug);

  Map<String, Object> saveMessage(MessageForm form, boolean admin);

  Map<String, Object> submit(SubmissionForm form, MultipartFile file);

  void saveStory(StoryForm form);

  void delete(String type, String id, Long version);

  Map<String, Object> export();
}
