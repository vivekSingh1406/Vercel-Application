package com.example.application;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.application.dto.*;
import com.example.application.exception.ContentException;
import com.example.application.repository.*;
import com.example.application.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
@org.springframework.security.test.context.support.WithMockUser(roles="ADMIN")
class MigrationTest {
  @Autowired ContentService service;
  @Autowired StaticMediaService media;
  @Autowired ImageStorageService images;
  @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
  @Autowired MockMvc mvc;
  @Autowired StoryRepository stories;
  @Autowired MessageRepository messages;

  @Test
  void originalSeedAndRoutes() throws Exception {
    assertThat(service.stories()).hasSize(3);
    assertThat(service.story("a-moment-by-the-pond").get("createdAt")).isEqualTo("2026-09-26");
    assertThat(service.messages()).hasSize(3);
    assertThat(media.gallery()).hasSize(6);
    assertThat(media.videos()).hasSize(6);
    for (String route :
        new String[] {
          "/", "/gallery", "/blog", "/blog/a-moment-by-the-pond", "/submit-blog", "/admin"
        }) mvc.perform(get(route)).andExpect(status().isOk());
    mvc.perform(get("/blog/not-a-story")).andExpect(status().isNotFound());
  }

  @Test
  void mediaCatalogIsStaticAndHasNoDatabaseTables() {
    assertThat(
            jdbc.queryForList(
                "select table_name from information_schema.tables where table_schema=database()",
                String.class))
        .contains("story", "community_message", "content_lock")
        .doesNotContain("gallery_item", "village_video");
    assertThat(media.gallery()).hasSize(6);
    assertThat(media.videos()).hasSize(6);
    assertThat(media.gallery().get(0).getSrc()).isEqualTo("/media/village-2.jpg");
  }

  @Test
  void validationCannotBeBypassedWithDirectPosts() throws Exception {
    mvc.perform(post("/messages").with(csrf()).param("name", "   ").param("message", "tiny"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.name").exists())
        .andExpect(jsonPath("$.errors.message").exists());
    mvc.perform(
            post("/submit-blog")
                .with(csrf())
                .param("name", "Test")
                .param("title", "tiny")
                .param("content", "a".repeat(79)))
        .andExpect(status().isBadRequest());
    mvc.perform(
            post("/admin/stories/save")
                .with(csrf())
                .param("title", "Valid title")
                .param("author", "Test")
                .param("slug", "BAD SLUG")
                .param("excerpt", "Introduction")
                .param("content", "a".repeat(80)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.slug").exists());
    mvc.perform(post("/messages").param("name", "Test").param("message", "Hello village"))
        .andExpect(status().isForbidden());
  }

  @Test
  void newestFiveMessagesPersistAndEditingKeepsDate() {
    String first = null;
    for (int i = 0; i < 6; i++) {
      MessageForm f = new MessageForm();
      f.setName("Visitor " + i);
      f.setMessage("Community message " + i);
      var saved = service.saveMessage(f, false);
      if (i == 0) first = (String) saved.get("id");
    }
    assertThat(messages.count()).isEqualTo(5);
    assertThat(messages.existsById(first)).isFalse();
    var before = service.messages().get(0);
    MessageForm edit = new MessageForm();
    edit.setId((String) before.get("id"));
    edit.setVersion((Long) before.get("version"));
    edit.setName("Updated name");
    edit.setMessage("Updated message");
    service.saveMessage(edit, true);
    var after = service.messages().get(0);
    assertThat(after.get("createdAt")).isEqualTo(before.get("createdAt"));
    assertThat(after.get("authorOfMessage")).isEqualTo("Updated name");
    assertThatThrownBy(() -> service.saveMessage(edit, true)).isInstanceOf(ContentException.class);
  }

  private StoryForm validStory() {
    StoryForm f = new StoryForm();
    f.setTitle("A test village story");
    f.setSlug("a-test-village-story");
    f.setAuthor("Test author");
    f.setExcerpt("A test introduction");
    f.setContent("A village memory. ".repeat(10));
    f.setCategory("Community");
    return f;
  }

  @Test
  void storyCrudUniqueSlugAndSafeImages() {
    StoryForm f = validStory();
    service.saveStory(f);
    var saved = service.story(f.getSlug());
    assertThat(saved).isNotNull();
    assertThatThrownBy(() -> service.saveStory(validStory()))
        .isInstanceOf(ContentException.class)
        .hasMessageContaining("already used");
    f.setId((String) saved.get("id"));
    f.setVersion((Long) saved.get("version"));
    f.setTitle("Edited village story");
    service.saveStory(f);
    assertThat(service.story(f.getSlug()).get("title")).isEqualTo("Edited village story");
    f.setVersion((Long) service.story(f.getSlug()).get("version"));
    f.setImage("javascript:alert(1)");
    assertThatThrownBy(() -> service.saveStory(f)).isInstanceOf(ContentException.class);
    service.delete("blog", f.getId(), f.getVersion());
    assertThat(service.story(f.getSlug())).isNull();
  }

  @Test
  void reviewPublishesDraftAtomicallyAndRetainsImageAndCreationDate() throws Exception {
    SubmissionForm f = new SubmissionForm();
    f.setName("Contributor");
    f.setTitle("A memory from home");
    f.setContent("A happy village memory. ".repeat(8));
    MockMultipartFile photo =
        new MockMultipartFile(
            "photo", "photo.png", "image/png", new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10});
    var draft = service.submit(f, photo);
    String image = (String) draft.get("image");
    assertThat(image).startsWith("/uploads/").doesNotContain("base64");
    assertThat(
            java.nio.file.Files.readAllBytes(
                images.directory().resolve(image.substring("/uploads/".length()))))
        .isEqualTo(photo.getBytes());
    assertThat(
            jdbc.queryForObject(
                "select image from story where id=?", String.class, draft.get("id")))
        .isEqualTo(image);
    assertThat(service.drafts()).hasSize(1);
    assertThat(service.story((String) draft.get("slug"))).isNull();
    StoryForm review = validStory();
    review.setId((String) draft.get("id"));
    review.setSourceDraft(review.getId());
    review.setVersion((Long) draft.get("version"));
    review.setImage((String) draft.get("image"));
    service.saveStory(review);
    var published = service.story(review.getSlug());
    assertThat(service.drafts()).isEmpty();
    assertThat(published.get("createdAt")).isEqualTo(draft.get("createdAt"));
    assertThat(published.get("image")).isEqualTo(draft.get("image"));
  }

  @Test
  void invalidImagesRejected() {
    SubmissionForm f = new SubmissionForm();
    f.setName("Test");
    f.setTitle("Test title");
    f.setContent("x".repeat(80));
    assertThatThrownBy(
            () ->
                service.submit(
                    f,
                    new MockMultipartFile("photo", "evil.png", "image/png", "<script>".getBytes())))
        .isInstanceOf(ContentException.class);
    assertThatThrownBy(
            () ->
                service.submit(
                    f,
                    new MockMultipartFile("photo", "large.jpg", "image/jpeg", new byte[1500001])))
        .isInstanceOf(ContentException.class);
  }

  @Test
  void exportAndWhatsAppPreserveContent() throws Exception {
    mvc.perform(get("/admin/export"))
        .andExpect(status().isOk())
        .andExpect(
            header()
                .string(
                    "Content-Disposition", "attachment; filename=\"gautiyan-tola-content.json\""))
        .andExpect(jsonPath("$.blogs.length()").value(3))
        .andExpect(jsonPath("$.messages.length()").value(3));
    String url = new WhatsAppService("919755752534").message("Name", "Hello");
    assertThat(java.net.URLDecoder.decode(url, java.nio.charset.StandardCharsets.UTF_8))
        .contains("New Message From Gautiyan Tola Website\n\nName:\nName\n\nMessage:\nHello");
    assertThat(new WhatsAppService("").contact()).isEmpty();
  }
}
