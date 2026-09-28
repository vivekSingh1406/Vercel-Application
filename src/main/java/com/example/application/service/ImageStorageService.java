package com.example.application.service;

import com.example.application.exception.ContentException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** Images live on disk; persistent story records contain only a URL. */
@Service
public class ImageStorageService {
  private final Path directory;

  public ImageStorageService(@Value("${app.upload-dir}") String directory) {
    this.directory = Path.of(directory).toAbsolutePath().normalize();
  }

  public Path directory() {
    return directory;
  }

  public String store(MultipartFile file) {
    if (file.getSize() > 1500000) throw invalidPhoto();
    try {
      return store(file.getBytes(), file.getContentType());
    } catch (IOException e) {
      throw new ContentException("photo", "This image could not be saved. Please try again.");
    }
  }

  private String store(byte[] bytes, String type) {
    boolean jpeg =
        bytes.length >= 3
            && (bytes[0] & 255) == 255
            && (bytes[1] & 255) == 216
            && (bytes[2] & 255) == 255;
    boolean png =
        bytes.length >= 8
            && Arrays.equals(
                Arrays.copyOf(bytes, 8), new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10});
    boolean webp =
        bytes.length >= 12
            && new String(bytes, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
            && new String(bytes, 8, 4, StandardCharsets.US_ASCII).equals("WEBP");
    if (bytes.length > 1500000
        || !("image/jpeg".equals(type) && jpeg
            || "image/png".equals(type) && png
            || "image/webp".equals(type) && webp)) throw invalidPhoto();
    String extension =
        "image/jpeg".equals(type) ? ".jpg" : "image/png".equals(type) ? ".png" : ".webp";
    String name = UUID.randomUUID() + extension;
    Path temporary = null;
    try {
      Files.createDirectories(directory);
      temporary = Files.createTempFile(directory, ".upload-", ".tmp");
      Files.write(temporary, bytes);
      Files.move(temporary, directory.resolve(name), java.nio.file.StandardCopyOption.ATOMIC_MOVE);
      return "/uploads/" + name;
    } catch (IOException e) {
      if (temporary != null)
        try {
          Files.deleteIfExists(temporary);
        } catch (IOException ignored) {
        }
      throw new ContentException("photo", "This image could not be saved. Please try again.");
    }
  }

  private static ContentException invalidPhoto() {
    return new ContentException("photo", "Choose a JPG, PNG, or WebP image smaller than 1.5 MB.");
  }

  public String imageUrl(String value) {
    if (value == null || value.isBlank()) return null;
    String v = value.trim();
    // Preserve compatibility with the original editor, but never put image bytes in MySQL.
    if (v.startsWith("data:")) {
      if (v.length() > 2000100) throw invalidPhoto();
      try {
        int comma = v.indexOf(',');
        String header = v.substring(0, comma);
        if (!header.matches("data:image/(jpeg|png|webp);base64"))
          throw new IllegalArgumentException();
        return store(
            Base64.getDecoder().decode(v.substring(comma + 1)),
            header.substring(5, header.indexOf(';')));
      } catch (IllegalArgumentException e) {
        throw invalidUrl();
      }
    }
    if (v.length() > 4096 || v.indexOf('\\') >= 0 || v.chars().anyMatch(Character::isISOControl))
      throw invalidUrl();
    if (v.startsWith("/") && !v.startsWith("//")) return v;
    try {
      var uri = java.net.URI.create(v);
      if ("https".equals(uri.getScheme()) && uri.getHost() != null) return v;
    } catch (IllegalArgumentException ignored) {
    }
    throw invalidUrl();
  }

  private static ContentException invalidUrl() {
    return new ContentException(
        "image", "Use a /media/ path, an HTTPS image URL, or a local image draft.");
  }
}
