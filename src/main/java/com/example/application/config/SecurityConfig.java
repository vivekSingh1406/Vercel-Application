package com.example.application.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Bean
  UserDetailsService users(
      @Value("${app.admin-username}") String user,
      @Value("${app.admin-password}") String password) {
    return new InMemoryUserDetailsManager(
        User.withUsername(user)
            .password(
                "{bcrypt}"
                    + new BCryptPasswordEncoder()
                        .encode(
                            password.isBlank() ? java.util.UUID.randomUUID().toString() : password))
            .roles("ADMIN")
            .build());
  }

  @Bean
  SecurityFilterChain chain(HttpSecurity http, @Value("${app.admin-password}") String password)
      throws Exception {
    http.authorizeHttpRequests(
        a -> {
          a.dispatcherTypeMatchers(
                  jakarta.servlet.DispatcherType.FORWARD, jakarta.servlet.DispatcherType.ERROR)
              .permitAll();
          if (!password.isBlank()) a.requestMatchers("/admin", "/admin/**").hasRole("ADMIN");
          a.anyRequest().permitAll();
        });
    http.httpBasic(org.springframework.security.config.Customizer.withDefaults());
    return http.build();
  }
}
