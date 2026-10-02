package com.example.application.config;

import com.example.application.exam.LearnerRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import static org.assertj.core.api.Assertions.*;

class SecurityConfigTest {
  @Test void formLoginPreservesMixedCaseAdminUsername() {
    var config = new SecurityConfig();
    var encoder = config.passwordEncoder();
    var repository = (LearnerRepository) java.lang.reflect.Proxy.newProxyInstance(
        LearnerRepository.class.getClassLoader(), new Class<?>[]{LearnerRepository.class},
        (proxy, method, args) -> { throw new AssertionError("Admin authentication must not query learners"); });
    var manager = config.authenticationManager(
        config.users(repository, encoder, "Microvista", "MVPL"), encoder);
    var request = new com.example.application.exam.AuthController.LoginRequest(" Microvista ", "MVPL");
    var auth = manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
        request.username(), request.password()));
    assertThat(auth.isAuthenticated()).isTrue();
    assertThat(auth.getAuthorities()).extracting("authority").contains("ROLE_ADMIN");
  }

  private AuthenticationManager manager() {
    var config = new SecurityConfig();
    var encoder = config.passwordEncoder();
    var repository = (LearnerRepository) java.lang.reflect.Proxy.newProxyInstance(
        LearnerRepository.class.getClassLoader(), new Class<?>[]{LearnerRepository.class},
        (proxy, method, args) -> { throw new AssertionError("Admin authentication must not query learners"); });
    var users = config.users(repository, encoder, "admin", "test-admin-password");
    return config.authenticationManager(users, encoder);
  }

  @Test void repeatedAdminAuthenticationSurvivesCredentialErasure() {
    var manager = manager();
    for (int i = 0; i < 4; i++) {
      var auth = manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("admin", "test-admin-password"));
      assertThat(auth.isAuthenticated()).isTrue();
      assertThat(auth.getCredentials()).isNull();
      assertThat(((UserDetails) auth.getPrincipal()).getPassword()).isNull();
    }
    assertThatThrownBy(() -> manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("admin", "wrong")))
        .isInstanceOf(BadCredentialsException.class);
  }

  @Test void concurrentAdminAuthenticationUsesIndependentPrincipals() throws Exception {
    var manager = manager();
    var pool = Executors.newFixedThreadPool(6);
    try {
      List<Callable<Boolean>> requests = new ArrayList<>();
      for (int i = 0; i < 18; i++) requests.add(() -> manager.authenticate(
          UsernamePasswordAuthenticationToken.unauthenticated("admin", "test-admin-password")).isAuthenticated());
      for (var result : pool.invokeAll(requests)) assertThat(result.get()).isTrue();
    } finally { pool.shutdownNow(); }
  }
}
