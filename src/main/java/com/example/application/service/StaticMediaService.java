package com.example.application.service;

import com.example.application.dto.GalleryItem;
import com.example.application.dto.VillageVideo;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/** Ordered display metadata for bundled files. This service never accesses a database. */
@Service
public class StaticMediaService {
  private final List<GalleryItem> gallery;
  private final List<VillageVideo> videos;

  public StaticMediaService(ObjectMapper mapper) throws IOException {
    try (var stream = new ClassPathResource("static/data/media.json").getInputStream()) {
      var catalog = mapper.readValue(stream, Catalog.class);
      gallery = List.copyOf(catalog.gallery());
      videos = List.copyOf(catalog.videos());
    }
  }

  public List<GalleryItem> gallery() {
    return gallery;
  }

  public List<VillageVideo> videos() {
    return videos;
  }

  public record Catalog(List<GalleryItem> gallery, List<VillageVideo> videos) {}
}
