package com.example.application.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class SiteContent {
  private final Map<String, Object> data;

  public SiteContent(ObjectMapper mapper) throws java.io.IOException {
    try (var in = new ClassPathResource("site.json").getInputStream()) {
      data =
          mapper.readValue(
              in, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
    }
  }

  public Object get(String key) {
    return data.get(key);
  }
}
