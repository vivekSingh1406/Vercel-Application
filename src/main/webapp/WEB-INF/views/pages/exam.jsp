<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ include file="../layout/header.jspf" %>
<link rel="stylesheet" href="${pageContext.request.contextPath}/css/exam.css"/>
<section class="container page exam-shell" id="exam-app" data-view="${examView}" data-attempt="${fn:escapeXml(attemptId)}">
  <div class="exam-toolbar"><nav aria-label="Exam navigation"><a href="/exam-center">Exam Center</a><a href="/exam-center/history">My results</a></nav><div><span id="learner-name"></span> <button type="button" class="button button-small" id="logout">Log out</button></div></div>
  <header class="page-heading"><p class="eyebrow">A LITTLE CURIOSITY, EVERY DAY</p><h1 id="exam-heading">Exam Center</h1><p id="exam-intro">Practice at your own pace. Your progress is saved as you go.</p></header>
  <div id="exam-error" class="exam-error" role="alert" hidden></div>
  <button id="exam-retry" class="button" hidden>Try again</button>
  <p id="exam-loading" role="status">Loading your workspace…</p>
  <div id="exam-content"></div>
  <noscript>Please enable JavaScript to save answers and take exams.</noscript>
</section>
<script type="module" src="${pageContext.request.contextPath}/js/exam.js"></script>
<%@ include file="../layout/footer.jspf" %>
