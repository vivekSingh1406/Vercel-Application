package com.example.application.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {
  private final String number;

  public WhatsAppService(@Value("${app.whatsapp-number}") String number) {
    this.number = number;
  }

  private String encode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }

  public String contact() {
    return contact("Hello Gautiyan Tola! I would like to connect with the community.");
  }

  public String contact(String text) {
    return number.matches("^[1-9][0-9]{7,14}$")
        ? "https://wa.me/" + number + "?text=" + encode(text)
        : "";
  }

  public String message(String name, String text) {
    return contact(
        "New Message From Gautiyan Tola Website\n\nName:\n" + name + "\n\nMessage:\n" + text);
  }

  public String blog(String author, String title, String content, String imageName) {
    return contact(
        "New Blog Submission\n\nAuthor:\n"
            + author
            + "\n\nTitle:\n"
            + title
            + "\n\nContent:\n"
            + content
            + (imageName == null
                ? ""
                : "\n\nImage: " + imageName + " (please attach manually in WhatsApp)"));
  }

  public String share(String title, String url) {
    return "https://wa.me/?text=" + encode(title + "\n" + url);
  }
}
