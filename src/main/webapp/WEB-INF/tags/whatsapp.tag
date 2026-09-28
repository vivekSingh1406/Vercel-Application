<%@ tag pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ attribute name="floating" type="java.lang.Boolean" required="true" %>
<c:choose><c:when test="${not empty requestScope.contactUrl}"><a class="${floating ? 'floating-whatsapp' : 'button button-primary'}" href="${fn:escapeXml(requestScope.contactUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Connect on WhatsApp"><ui:icon name="chat"/><c:if test="${not floating}">Let’s talk on WhatsApp</c:if></a></c:when><c:otherwise><button class="${floating ? 'floating-whatsapp' : 'button button-primary'}" data-whatsapp-unavailable aria-label="WhatsApp contact information"><ui:icon name="chat"/><c:if test="${not floating}">Let’s talk on WhatsApp</c:if></button></c:otherwise></c:choose>