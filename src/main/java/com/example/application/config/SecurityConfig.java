package com.example.application.config;

import com.example.application.exam.LearnerRepository;
import jakarta.servlet.http.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.*;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.*;

@Configuration
public class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder() { return PasswordEncoderFactories.createDelegatingPasswordEncoder(); }
  @Bean UserDetailsService users(LearnerRepository learners, PasswordEncoder encoder,
      @Value("${app.admin-username}") String name, @Value("${app.admin-password}") String password) {
    final String adminHash = encoder.encode(
        password.isBlank() ? java.util.UUID.randomUUID().toString() : password);
    return username -> {
      // ProviderManager erases the authenticated principal's credentials. Never reuse
      // that mutable User instance across Basic-auth requests or browser asset loads.
      if (name.equals(username)) {
        return User.withUsername(name).password(adminHash).roles("ADMIN").build();
      }
      var learner=learners.findByUsername(username.strip().toLowerCase(java.util.Locale.ROOT))
          .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
      return User.withUsername(learner.getId()).password(learner.getPasswordHash()).disabled(!learner.isActive()).roles("LEARNER").build();
    };
  }
  @Bean AuthenticationManager authenticationManager(UserDetailsService users,PasswordEncoder encoder) {
    var provider=new DaoAuthenticationProvider(users); provider.setPasswordEncoder(encoder);
    return new ProviderManager(provider);
  }
  @Bean SecurityContextRepository securityContexts() { return new HttpSessionSecurityContextRepository(); }
  @Bean CsrfTokenRepository csrfTokens() { return new HttpSessionCsrfTokenRepository(); }
  @Bean SessionAuthenticationStrategy sessionAuthenticationStrategy(CsrfTokenRepository tokens) {
    return new CompositeSessionAuthenticationStrategy(List.of(new ChangeSessionIdAuthenticationStrategy(),new CsrfAuthenticationStrategy(tokens)));
  }
  private static void json(HttpServletResponse response,int status,String message) throws java.io.IOException {
    response.setStatus(status); response.setContentType("application/json");
    response.getWriter().write("{\"message\":\""+message+"\"}");
  }
  @Bean SecurityFilterChain chain(HttpSecurity http,@Value("${app.admin-password}") String password,
      SecurityContextRepository contexts,CsrfTokenRepository tokens,AuthenticationManager manager,LearnerRepository learners) throws Exception {
    http.authenticationManager(manager).securityContext(c -> c.securityContextRepository(contexts));
    http.csrf(c -> c.csrfTokenRepository(tokens));
    http.authorizeHttpRequests(a -> {
      a.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.FORWARD,jakarta.servlet.DispatcherType.ERROR).permitAll();
      a.requestMatchers("/api/auth/signup").denyAll();
      a.requestMatchers("/admin/exam-center", "/admin/exam-center/**").hasRole("ADMIN");
      a.requestMatchers("/admin","/admin/**").hasRole("ADMIN");
      a.requestMatchers("/exam-center","/exam-center/**").hasAnyRole("LEARNER","ADMIN");
      a.requestMatchers("/api/exams","/api/exams/**","/api/auth/me").hasRole("LEARNER");
      a.anyRequest().permitAll();
    });
    // Browsers may keep sending cached admin credentials on all same-origin requests.
    // Interpret Basic credentials only for the admin workspace, so they cannot
    // replace a learner session or interfere with signup/login and public assets.
    http.httpBasic(b -> b.addObjectPostProcessor(
        new org.springframework.security.config.ObjectPostProcessor<org.springframework.security.web.authentication.www.BasicAuthenticationFilter>() {
          @Override
          public <O extends org.springframework.security.web.authentication.www.BasicAuthenticationFilter> O postProcess(O filter) {
            var converter = new org.springframework.security.web.authentication.www.BasicAuthenticationConverter();
            filter.setAuthenticationConverter(request -> {
              String path = request.getRequestURI().substring(request.getContextPath().length());
              return path.equals("/admin") || path.startsWith("/admin/") ? converter.convert(request) : null;
            });
            return filter;
          }
        }));
    http.exceptionHandling(e -> e.authenticationEntryPoint((req,res,error) -> {
      if (req.getRequestURI().startsWith(req.getContextPath()+"/admin/exam-center")
          && !req.getRequestURI().startsWith(req.getContextPath()+"/admin/exam-center/api")
          && java.util.Objects.toString(req.getHeader("Accept"),"").contains("text/html")) {
        res.sendRedirect(req.getContextPath()+"/admin-login");
      }
      else if (req.getRequestURI().startsWith(req.getContextPath()+"/api/") || req.getRequestURI().startsWith(req.getContextPath()+"/admin/exam-center/api/")) json(res,401,"Your session has expired. Please log in again.");
      else if (req.getRequestURI().startsWith(req.getContextPath()+"/exam-center")) res.sendRedirect(req.getContextPath()+"/login");
      else { res.setHeader("WWW-Authenticate","Basic realm=\"Content workspace\""); res.sendError(401); }
    }).accessDeniedHandler((req,res,error) -> {
      var auth=SecurityContextHolder.getContext().getAuthentication();
      boolean anonymous=auth==null || auth instanceof AnonymousAuthenticationToken;
      if (req.getRequestURI().startsWith(req.getContextPath()+"/api/")) {
        boolean exam=req.getRequestURI().startsWith(req.getContextPath()+"/api/exams");
        json(res,anonymous && exam ? 401 : 403,anonymous && exam ? "Your session has expired. Please log in again." : "Access denied or security token expired. Reload the page and try again.");
      } else res.sendError(403);
    }));
    http.addFilterBefore(new org.springframework.web.filter.OncePerRequestFilter() {
      @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,jakarta.servlet.FilterChain chain)
          throws jakarta.servlet.ServletException,java.io.IOException {
        var auth=SecurityContextHolder.getContext().getAuthentication();
        if (auth!=null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_LEARNER"))
            && learners.findById(auth.getName()).filter(com.example.application.exam.Learner::isActive).isEmpty()) {
          SecurityContextHolder.clearContext();
          var session=req.getSession(false); if(session!=null) session.invalidate();
          json(res,401,"This student account is inactive. Contact your administrator."); return;
        }
        chain.doFilter(req,res);
      }
    },org.springframework.security.web.access.intercept.AuthorizationFilter.class);
    http.logout(l -> l.logoutUrl("/api/auth/logout").invalidateHttpSession(true).clearAuthentication(true)
        .deleteCookies("JSESSIONID").logoutSuccessHandler((req,res,auth) -> json(res,200,"You have been logged out.")));
    return http.build();
  }
}
