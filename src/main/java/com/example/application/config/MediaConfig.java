package com.example.application.config;

import com.example.application.service.ImageStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MediaConfig implements WebMvcConfigurer {
  private final ImageStorageService images;

  public MediaConfig(ImageStorageService images) {
    this.images = images;
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String location = images.directory().toUri().toString();
    registry
        .addResourceHandler("/uploads/**")
        .addResourceLocations(location.endsWith("/") ? location : location + "/");
  }
}
