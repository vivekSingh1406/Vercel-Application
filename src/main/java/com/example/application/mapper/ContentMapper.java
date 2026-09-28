package com.example.application.mapper;

import com.example.application.entity.*;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
public class ContentMapper {
  private static final DateTimeFormatter DATE =
      DateTimeFormatter.ofPattern("MMM d, uuuu", Locale.ENGLISH).withZone(ZoneOffset.UTC);

  public Map<String, Object> story(Story s) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", s.getId());
    m.put("title", s.getTitle());
    m.put("slug", s.getSlug());
    m.put("excerpt", s.getExcerpt());
    m.put("content", s.getContent());
    m.put("author", s.getAuthor());
    m.put("image", s.getImage());
    m.put("imageName", s.getImageName());
    m.put("category", s.getCategory());
    m.put(
        "createdAt",
        s.isDateOnly()
            ? s.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate().toString()
            : s.getCreatedAt().toString());
    m.put("date", DATE.format(s.getCreatedAt()));
    m.put(
        "longDate",
        DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.ENGLISH)
            .withZone(ZoneOffset.UTC)
            .format(s.getCreatedAt()));
    m.put(
        "mediumDateTime",
        DateTimeFormatter.ofPattern("MMM d, uuuu, h:mm:ss a", Locale.ENGLISH)
            .withZone(ZoneOffset.UTC)
            .format(s.getCreatedAt()));
    m.put("version", s.getVersion());
    m.put("paragraphs", s.getContent().split("\n\n", -1));
    m.put(
        "readingMinutes",
        Math.max(1, (int) Math.ceil(s.getContent().split("\\s+").length / 200.0)));
    return m;
  }

  public Map<String, Object> message(CommunityMessage s) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", s.getId());
    m.put("message", s.getMessage());
    m.put("authorOfMessage", s.getAuthorOfMessage());
    m.put("createdAt", s.getCreatedAt().toString());
    m.put("date", DATE.format(s.getCreatedAt()));
    m.put(
        "longDate",
        DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.ENGLISH)
            .withZone(ZoneOffset.UTC)
            .format(s.getCreatedAt()));
    m.put(
        "mediumDateTime",
        DateTimeFormatter.ofPattern("MMM d, uuuu, h:mm:ss a", Locale.ENGLISH)
            .withZone(ZoneOffset.UTC)
            .format(s.getCreatedAt()));
    m.put("version", s.getVersion());
    return m;
  }
}
