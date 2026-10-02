package com.example.application.exam;

import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  public record LoginRequest(@com.fasterxml.jackson.annotation.JsonAlias("email") @NotBlank @Size(max=254) String username,@NotBlank @Size(max=64) String password) {
    public LoginRequest { if(username!=null) username=username.strip(); }
  }
  private final LearnerRepository users;
  private final AuthenticationManager manager;
  private final SecurityContextRepository contexts;
  private final SessionAuthenticationStrategy sessions;
  public AuthController(LearnerRepository users,AuthenticationManager manager,
      SecurityContextRepository contexts,SessionAuthenticationStrategy sessions) {
    this.users=users; this.manager=manager; this.contexts=contexts; this.sessions=sessions;
  }
  private Map<String,Object> safe(Learner u) { var out=new LinkedHashMap<String,Object>(); out.put("id",u.getId()); out.put("name",u.getName()); out.put("username",u.getUsername()); out.put("email",u.getEmail()); return out; }
  @GetMapping("/csrf") public Map<String,String> csrf(CsrfToken token) {
    return Map.of("token",token.getToken(),"headerName",token.getHeaderName());
  }
  @PostMapping("/login") public Object login(@Valid @RequestBody LoginRequest body,HttpServletRequest request,HttpServletResponse response) {
    Authentication auth;
    try {
      auth=manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(body.username(),body.password()));

    } catch (org.springframework.security.core.AuthenticationException | IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Username or password is incorrect.");
    }
    sessions.onAuthentication(auth,request,response);
    var context=SecurityContextHolder.createEmptyContext(); context.setAuthentication(auth);
    SecurityContextHolder.setContext(context); contexts.saveContext(context,request,response);
    boolean admin=auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    return Map.of("user",admin ? Map.of("name",auth.getName(),"username",auth.getName(),"role","ADMIN") : safe(users.findById(auth.getName()).orElseThrow()),
        "redirectUrl",admin ? "/admin/exam-center/students" : "/exam-center");
  }
  @GetMapping("/me") public Object me(Authentication auth) {
    return Map.of("user",safe(users.findById(auth.getName()).filter(Learner::isActive).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Please log in again."))));
  }
}
