<%@ tag pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ attribute name="message" type="java.util.Map" required="true" %>
<app-message-card><article class="message-card"><span class="quote-mark" aria-hidden="true">“</span><blockquote><c:out value="${message.message}"/></blockquote><div class="message-author"><span class="avatar"><c:out value="${fn:substring(message.authorOfMessage,0,1)}"/></span><div><strong><c:out value="${message.authorOfMessage}"/></strong><small data-date="${message.createdAt}"><c:out value="${message.date}"/></small></div></div></article></app-message-card>