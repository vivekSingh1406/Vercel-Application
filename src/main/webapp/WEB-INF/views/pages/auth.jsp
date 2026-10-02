<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ include file="../layout/header.jspf" %>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/exam.css"/>
<section class="container page exam-shell auth-shell" data-auth-mode="${authMode}">
  <header class="page-heading"><p class="eyebrow">LEARN · PRACTICE · GROW</p><h1><c:out value="${pageTitle}"/></h1><p>${adminLogin ? "Manage students and exam results." : "Sign in to view available exams and your current results."}</p></header>
  <div class="exam-card">
    <p id="auth-message" role="status" aria-live="polite"></p>
    <form id="auth-form" novalidate>
      <label for="username">Username</label><input id="username" name="username" type="text" required maxlength="254" autocomplete="username"/><small id="username-error" class="field-error"></small>
      <label for="password">Password</label><input id="password" name="password" type="password" required maxlength="64" autocomplete="current-password"/><small id="password-error" class="field-error"></small>
      <button class="button button-primary" type="submit">Log in</button>
    </form>
    <c:choose><c:when test="${adminLogin}"><p class="auth-switch">Use your configured admin credentials. <a href="/login">Student login</a></p></c:when><c:otherwise><p class="auth-switch">Use the username and password provided by your administrator.</p><p><a class="text-link" href="/admin-login">Administrator? Log in to manage students →</a></p></c:otherwise></c:choose>
  </div>
</section>
<script type="module" src="${pageContext.request.contextPath}/js/exam.js"></script>
<%@ include file="../layout/footer.jspf" %>
