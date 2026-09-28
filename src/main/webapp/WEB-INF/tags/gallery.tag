<%@ tag pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ attribute name="items" type="java.util.List" required="true" %>
<%@ attribute name="preview" type="java.lang.Boolean" required="true" %>
<app-gallery-grid><div class="gallery-grid ${preview ? 'preview' : ''}"><c:forEach items="${items}" var="item"><button class="gallery-tile" data-gallery data-title="${fn:escapeXml(item.title)}" data-category="${fn:escapeXml(item.category)}" data-credit="${fn:escapeXml(item.credit)}" aria-label="View ${fn:escapeXml(item.title)}"><img src="${fn:escapeXml(item.src)}" alt="${fn:escapeXml(item.alt)}" loading="lazy" width="700" height="560"/><span class="gallery-caption"><span><small><c:out value="${item.category}"/></small><strong><c:out value="${item.title}"/></strong></span><span class="circle-arrow">↗</span></span></button></c:forEach></div></app-gallery-grid>