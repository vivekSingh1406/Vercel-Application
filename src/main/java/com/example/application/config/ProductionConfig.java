package com.example.application.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("production")
public class ProductionConfig {
  public ProductionConfig(@Value("${app.admin-password}") String password) {
    if (password.isBlank())
      throw new IllegalStateException("ADMIN_PASSWORD must be set in production.");
  }
}
