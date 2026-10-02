package com.example.application.controller;

import com.example.application.config.SiteContent;
import com.example.application.service.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class PageController {
  private final ContentService content;
  private final StaticMediaService media;
  private final WhatsAppService whatsapp;
  private final SiteContent site;

  public PageController(
      ContentService content,
      WhatsAppService whatsapp,
      SiteContent site,
      StaticMediaService media) {
    this.content = content;
    this.media = media;
    this.whatsapp = whatsapp;
    this.site = site;
  }

  @ModelAttribute
  public void common(Model m, HttpServletRequest request) {
    m.addAttribute("config", site.get("SITE_CONFIG"));
    m.addAttribute("info", site.get("VILLAGE_INFO"));
    m.addAttribute("themes", site.get("THEMES"));
    m.addAttribute("icons", site.get("ICONS"));
    m.addAttribute("contactUrl", whatsapp.contact());
    m.addAttribute("year", java.time.Year.now().getValue());
    m.addAttribute("pageUrl", request.getRequestURL().toString());
    m.addAttribute("pageTitle", "Gautiyan Tola");
    m.addAttribute(
        "description",
        "Discover Gautiyan Tola (Saman) through village photographs, shared memories, community"
            + " voices and stories of home.");
    m.addAttribute(
        "ogImage",
        request
            .getRequestURL()
            .toString()
            .replace(request.getRequestURI(), request.getContextPath() + "/media/village-2.jpg"));
  }

  @GetMapping("/")
  public String home(Model m) {
    m.addAttribute("pageTitle", "Welcome home");
    m.addAttribute("blogs", content.stories().stream().limit(3).toList());
    m.addAttribute("messages", content.messages());
    m.addAttribute("gallery", media.gallery().stream().limit(4).toList());
    m.addAttribute("videos", media.videos().stream().limit(3).toList());
    m.addAttribute(
        "heroVideo",
        media.videos().stream().filter(v -> v.getId().equals("v2")).findFirst().orElse(null));
    return "pages/home";
  }

  @GetMapping("/gallery")
  public String gallery(Model m) {
    m.addAttribute("pageTitle", "Village gallery & films");
    m.addAttribute("gallery", media.gallery());
    m.addAttribute(
        "categories", media.gallery().stream().map(v -> v.getCategory()).distinct().toList());
    m.addAttribute("videos", media.videos());
    return "pages/gallery";
  }

  @GetMapping("/blog")
  public String blogs(Model m) {
    m.addAttribute("pageTitle", "Village journal");
    m.addAttribute("blogs", content.stories());
    return "pages/blog-list";
  }

  @GetMapping("/blog/{slug}")
  public String detail(
      @PathVariable String slug, Model m, HttpServletRequest req, HttpServletResponse res) {
    var story = content.story(slug);
    m.addAttribute("story", story);
    m.addAttribute("pageTitle", story == null ? "Story not found" : story.get("title"));
    if (story == null) res.setStatus(404);
    else {
      m.addAttribute("description", story.get("excerpt"));
      m.addAttribute(
          "shareUrl", whatsapp.share((String) story.get("title"), req.getRequestURL().toString()));
      if (story.get("image") != null)
        m.addAttribute(
            "ogImage",
            java.net
                .URI
                .create(req.getRequestURL().toString())
                .resolve((String) story.get("image"))
                .toString());
    }
    return "pages/blog-detail";
  }

  @GetMapping("/submit-blog")
  public String submission(Model m) {
    m.addAttribute("pageTitle", "Share your village story");
    return "pages/submit-blog";
  }

  @GetMapping("/admin")
  public String admin(Model m) {
    m.addAttribute("pageTitle", "Content workspace");
    m.addAttribute("blogs", content.stories());
    m.addAttribute("messages", content.messages());
    m.addAttribute("drafts", content.drafts());
    return "pages/admin";
  }
  @GetMapping({"/admin/exam-center", "/admin/exam-center/students", "/admin/exam-center/students/{studentId}",
      "/admin/exam-center/results", "/admin/exam-center/results/{resultId}"})
  public String examAdministration(Model m) {
    m.addAttribute("pageTitle","Exam Center administration"); return "pages/exam-admin";
  }
  @GetMapping({"/login", "/signup", "/admin-login"})
  public String authentication(Model m, HttpServletRequest request) {
    m.addAttribute("authMode","login");
    m.addAttribute("adminLogin",request.getServletPath().equals("/admin-login"));
    m.addAttribute("pageTitle",request.getServletPath().equals("/admin-login") ? "Admin login" : "Student login");
    return "pages/auth";
  }

  @GetMapping({"/exam-center", "/exam-center/history", "/exam-center/attempts/{attemptId}",
      "/exam-center/attempts/{attemptId}/result", "/exam-center/attempts/{attemptId}/review"})
  public String exams(Model m, HttpServletRequest request, @PathVariable(required=false) String attemptId) {
    if (request.isUserInRole("ADMIN")) return "redirect:/admin/exam-center/students";
    String path=request.getServletPath();
    String view=path.endsWith("/history") ? "history" : path.endsWith("/result") ? "result"
        : path.endsWith("/review") ? "review" : attemptId!=null ? "attempt" : "center";
    m.addAttribute("examView",view);
    m.addAttribute("attemptId",attemptId);
    m.addAttribute("pageTitle","Exam Center");
    return "pages/exam";
  }
}
