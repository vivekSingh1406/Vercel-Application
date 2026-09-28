<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ include file="../layout/header.jspf" %>
<div class="container page"><header class="page-heading"><p class="eyebrow"><c:out value="${info.pages.gallery.eyebrow}"/></p><h1><c:out value="${info.pages.gallery.title}"/></h1><p><c:out value="${info.gallery.description}"/></p></header><div class="filter-row" aria-label="Filter photographs"><button class="active" data-filter="All moments" aria-pressed="true">All moments</button><c:forEach items="${categories}" var="category"><button data-filter="${fn:escapeXml(category)}" aria-pressed="false"><c:out value="${category}"/></button></c:forEach></div><ui:gallery items="${gallery}" preview="${false}"/><p class="media-note"><c:out value="${info.mediaCredit}"/></p><section id="videos" class="section"><ui:section eyebrow="${info.videos.eyebrow}" title="${info.videos.title}" description="${info.videos.description}"/><ui:videos items="${videos}"/></section></div>
<%@ include file="../layout/footer.jspf" %>