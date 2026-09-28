package com.example.application.controller;

import com.example.application.config.SiteContent;
import com.example.application.service.WhatsAppService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SiteErrorController implements ErrorController {
  private final SiteContent site;
  private final WhatsAppService whatsapp;

  public SiteErrorController(SiteContent site, WhatsAppService whatsapp) {
    this.site = site;
    this.whatsapp = whatsapp;
  }

  @RequestMapping("/error")
  public String error(Model m, HttpServletRequest request) {
    m.addAttribute("config", site.get("SITE_CONFIG"));
    m.addAttribute("info", site.get("VILLAGE_INFO"));
    m.addAttribute("themes", site.get("THEMES"));
    m.addAttribute("icons", site.get("ICONS"));
    m.addAttribute("year", java.time.Year.now().getValue());
    m.addAttribute("contactUrl", whatsapp.contact());
    m.addAttribute("pageTitle", "Page not found");
    Object status = request.getAttribute("jakarta.servlet.error.status_code");
    m.addAttribute("serverError", status != null && !status.equals(404));
    return "pages/not-found";
  }
}
