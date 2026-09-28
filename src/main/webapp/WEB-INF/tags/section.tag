<%@ tag pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ attribute name="eyebrow" type="java.lang.String" required="true" %>
<%@ attribute name="title" type="java.lang.String" required="true" %>
<%@ attribute name="description" type="java.lang.String" required="true" %>
<app-section-title><p class="eyebrow"><span></span><c:out value="${eyebrow}"/></p><h2><c:out value="${title}"/></h2><c:if test="${not empty description}"><p class="section-description"><c:out value="${description}"/></p></c:if></app-section-title>