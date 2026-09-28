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
}
