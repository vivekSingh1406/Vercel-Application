package com.example.application.service.impl;

import com.example.application.dto.*;
import com.example.application.entity.*;
import com.example.application.exception.ContentException;
import com.example.application.mapper.ContentMapper;
import com.example.application.repository.*;
import com.example.application.service.ContentService;
import java.text.Normalizer;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ContentServiceImpl implements ContentService {
  private final StoryRepository stories;
  private final MessageRepository messages;
  private final com.example.application.service.ImageStorageService imageStorage;
  private final ContentLockRepository lock;
  private final ContentMapper mapper;

  public ContentServiceImpl(
      StoryRepository stories,
      MessageRepository messages,
      com.example.application.service.ImageStorageService imageStorage,
      ContentLockRepository lock,
      ContentMapper mapper) {
    this.stories = stories;
    this.messages = messages;
    this.imageStorage = imageStorage;
    this.lock = lock;
    this.mapper = mapper;
  }

  public List<Map<String, Object>> stories() {
    return stories.findByStatusOrderByCreatedAtDescIdAsc("PUBLISHED").stream()
        .map(mapper::story)
        .toList();
  }

  public List<Map<String, Object>> drafts() {
    return stories.findByStatusOrderByCreatedAtDescIdAsc("DRAFT").stream()
        .map(mapper::story)
        .toList();
  }

  public List<Map<String, Object>> messages() {
    return messages.findAllByOrderByCreatedAtDescIdAsc().stream().map(mapper::message).toList();
  }

  public Map<String, Object> story(String slug) {
    return stories.findByPublishedSlug(slug).map(mapper::story).orElse(null);
  }

  public static String slug(String title) {
    String s =
        Normalizer.normalize(title.toLowerCase(Locale.ROOT), Normalizer.Form.NFKD)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-|-$", "");
    return s.isEmpty() ? "village-story" : s;
  }

  private static boolean present(String s) {
    return s != null && !s.isBlank();
  }

  private static void version(Long supplied, Long current) {
    if (!Objects.equals(supplied, current))
      throw new ContentException(
          "", "This item changed in another session. Reload before editing again.");
  }

  private static ResponseStatusException missing() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND);
  }

  @Transactional
  public Map<String, Object> saveMessage(MessageForm f, boolean admin) {
    lock.acquire();
    CommunityMessage m;
    if (admin && present(f.getId())) {
      m = messages.findById(f.getId()).orElseThrow(ContentServiceImpl::missing);
      version(f.getVersion(), m.getVersion());
    } else {
      m = new CommunityMessage();
      m.setId(UUID.randomUUID().toString());
      m.setCreatedAt(Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS));
    }
    m.setAuthorOfMessage(f.getName().trim());
    m.setMessage(f.getMessage().trim());
    messages.saveAndFlush(m);
    List<CommunityMessage> all = messages.findAllByOrderByCreatedAtDescIdAsc();
    if (all.size() > 5) messages.deleteAll(all.subList(5, all.size()));
    return mapper.message(m);
  }

  @Transactional
  public Map<String, Object> submit(SubmissionForm f, MultipartFile file) {
    Story s = new Story();
    String id = UUID.randomUUID().toString();
    s.setId(id);
    s.setAuthor(f.getName().trim());
    s.setTitle(f.getTitle().trim());
    s.setContent(f.getContent().trim());
    s.setExcerpt(s.getContent().substring(0, Math.min(150, s.getContent().length())));
    s.setSlug(slug(s.getTitle()) + "-" + id.substring(0, 8));
    s.setCreatedAt(Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS));
    s.setStatus("DRAFT");
    if (file != null && !file.isEmpty()) {
      s.setImage(imageStorage.store(file));
      String name =
          Optional.ofNullable(file.getOriginalFilename()).orElse("photo").replace('\\', '/');
      name = name.substring(name.lastIndexOf('/') + 1);
      s.setImageName(name.substring(0, Math.min(name.length(), 255)));
    }
    return mapper.story(stories.saveAndFlush(s));
  }

  @Transactional
  public void saveStory(StoryForm f) {
    lock.acquire();
    Story s;
    if (present(f.getId())) {
      s = stories.findById(f.getId()).orElseThrow(ContentServiceImpl::missing);
      version(f.getVersion(), s.getVersion());
      if ("DRAFT".equals(s.getStatus()) && !s.getId().equals(f.getSourceDraft()))
        throw new ContentException("", "Review the draft before publishing it.");
    } else {
      s = new Story();
      s.setId(UUID.randomUUID().toString());
      s.setCreatedAt(Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS));
    }
    if (stories.existsByPublishedSlugAndIdNot(f.getSlug(), s.getId()))
      throw new ContentException(
          "slug", "That story URL is already used. Choose a different slug.");
    s.setTitle(f.getTitle().trim());
    s.setSlug(f.getSlug());
    s.setPublishedSlug(f.getSlug());
    s.setAuthor(f.getAuthor().trim());
    s.setExcerpt(f.getExcerpt().trim());
    s.setContent(f.getContent().trim());
    s.setImage(imageStorage.imageUrl(f.getImage()));
    s.setCategory(f.getCategory());
    s.setStatus("PUBLISHED");
    stories.saveAndFlush(s);
  }

  @Transactional
  public void delete(String type, String id, Long supplied) {
    lock.acquire();
    if ("message".equals(type)) {
      CommunityMessage m = messages.findById(id).orElseThrow(ContentServiceImpl::missing);
      version(supplied, m.getVersion());
      messages.delete(m);
    } else if ("blog".equals(type) || "draft".equals(type)) {
      Story s = stories.findById(id).orElseThrow(ContentServiceImpl::missing);
      if (!s.getStatus().equals("draft".equals(type) ? "DRAFT" : "PUBLISHED")) throw missing();
      version(supplied, s.getVersion());
      stories.delete(s);
    } else throw missing();
  }

  public Map<String, Object> export() {
    return Map.of(
        "exportedAt",
        Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS).toString(),
        "blogs",
        stories(),
        "messages",
        messages(),
        "submissions",
        drafts());
  }
}
