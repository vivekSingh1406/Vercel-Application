<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ include file="../layout/header.jspf" %>
<section class="container page empty-state"><p class="eyebrow">A little off the beaten path</p><h1>Let’s find our way home.</h1><p><c:choose><c:when test="${serverError}">We couldn’t complete that request. Please try again.</c:when><c:otherwise>This page does not exist. There is still plenty of our village to discover.</c:otherwise></c:choose></p><a class="button button-primary" href="${pageContext.request.contextPath}/">Back to home →</a></section>
<%@ include file="../layout/footer.jspf" %>