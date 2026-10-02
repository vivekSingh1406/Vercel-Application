package com.example.application;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {"app.admin-password=integration-test-only"})
@org.springframework.test.context.ActiveProfiles("test")
@AutoConfigureMockMvc
class AdminSecurityTest {
  @Autowired MockMvc mvc;
  @Autowired com.example.application.exam.LearnerRepository learners;

  @Test
  void configuredCredentialsProtectWorkspaceAndExport() throws Exception {
    mvc.perform(get("/")).andExpect(status().isOk());
    mvc.perform(get("/admin")).andExpect(status().isUnauthorized());
    mvc.perform(get("/admin/export")).andExpect(status().isUnauthorized());
    mvc.perform(get("/admin").with(httpBasic("admin", "wrong")))
        .andExpect(status().isUnauthorized());
    mvc.perform(get("/admin").with(httpBasic("admin", "integration-test-only")))
        .andExpect(status().isOk());
  }
  @Test
  @org.springframework.transaction.annotation.Transactional
  void learnerRoleCannotAccessAdminWorkspace() throws Exception {
    var u=new com.example.application.exam.Learner(); u.setId(java.util.UUID.randomUUID().toString());
    u.setUsername("security-"+u.getId());u.setName("Security learner");u.setPasswordHash("unused");u.setCreatedAt(java.time.Instant.now());learners.saveAndFlush(u);
    for (String path : new String[]{"/admin", "/admin/export"}) {
      mvc.perform(get(path).with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(u.getId()).roles("LEARNER")))
          .andExpect(status().isForbidden());
    }
  }
  @Test
  void repeatedBasicAuthenticationWorksForPagesAssetsAndExport() throws Exception {
    for (int round = 0; round < 3; round++) {
      for (String path : new String[]{"/admin", "/admin/export", "/", "/css/site.css", "/js/site.js"}) {
        mvc.perform(get(path).with(httpBasic("admin", "integration-test-only")))
            .andExpect(status().isOk());
      }
    }
    mvc.perform(get("/admin").with(httpBasic("admin", "wrong")))
        .andExpect(status().isUnauthorized());
    mvc.perform(get("/admin").with(httpBasic("admin", "integration-test-only")))
        .andExpect(status().isOk());
  }
}
