<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ include file="../layout/header.jspf" %>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/exam.css"/>
<section class="container page exam-shell">
  <nav class="exam-toolbar" aria-label="Administration"><a href="/admin">Content workspace</a><a href="/admin/exam-center/students">Students</a><a href="/admin/exam-center/results">Results</a><button type="button" class="button button-small" id="admin-logout">Log out</button></nav>
  <header class="page-heading"><p class="eyebrow">EXAM CENTER · ADMINISTRATION</p><h1 id="admin-heading">Student Management</h1></header>
  <p id="admin-error" class="exam-error" role="alert" hidden></p>
  <div id="admin-content"><p role="status">Loading…</p></div>
</section>
<script type="module" src="${pageContext.request.contextPath}/js/exam-admin.js"></script>
<%@ include file="../layout/footer.jspf" %>
