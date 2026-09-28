package com.example.application.controller;

import com.example.application.dto.*;
import com.example.application.service.*;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Controller
public class ContentController {
  private final ContentService content;
  private final WhatsAppService whatsapp;

  public ContentController(ContentService content, WhatsAppService whatsapp) {
    this.content = content;
    this.whatsapp = whatsapp;
  }

  @PostMapping("/messages")
  @ResponseBody
  public Map<String, Object> message(@Valid @ModelAttribute MessageForm f) {
    var saved = content.saveMessage(f, false);
    return Map.of(
        "message",
        "Your message is saved.",
        "url",
        whatsapp.message((String) saved.get("authorOfMessage"), (String) saved.get("message")),
        "messages",
        content.messages());
  }

  @PostMapping("/submit-blog")
  @ResponseBody
  public Map<String, Object> submit(
      @Valid @ModelAttribute SubmissionForm f,
      @RequestParam(required = false) MultipartFile photo) {
    var s = content.submit(f, photo);
    return Map.of(
        "message",
        "Your story is saved for review.",
        "url",
        whatsapp.blog(
            (String) s.get("author"),
            (String) s.get("title"),
            (String) s.get("content"),
            (String) s.get("imageName")));
  }

  @PostMapping("/admin/stories/save")
  @ResponseBody
  public Map<String, String> story(@Valid @ModelAttribute StoryForm f) {
    content.saveStory(f);
    return Map.of("message", "Story saved.");
  }

  @PostMapping("/admin/messages/save")
  @ResponseBody
  public Map<String, String> adminMessage(@Valid @ModelAttribute MessageForm f) {
    content.saveMessage(f, true);
    return Map.of("message", "Message saved.");
  }

  @PostMapping("/admin/{type}/{id}/delete")
  @ResponseBody
  public Map<String, String> delete(
      @PathVariable String type, @PathVariable String id, @RequestParam Long version) {
    content.delete(type, id, version);
    return Map.of("message", "Removed from the saved content.");
  }

  @GetMapping("/admin/export")
  public ResponseEntity<Map<String, Object>> export() {
    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"gautiyan-tola-content.json\"")
        .body(content.export());
  }
}
