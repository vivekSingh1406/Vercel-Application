<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<%@ taglib prefix="ui" tagdir="/WEB-INF/tags" %>
<%@ include file="../layout/header.jspf" %>
<%@ include file="../fragments/hero.jspf" %>
<div class="belonging-strip">
  <div class="container">
    <c:forEach items="${info.belonging}" var="value" varStatus="loop">
      <span><ui:icon name="${value.icon}"/><c:out value="${value.text}"/></span>
      <c:if test="${not loop.last}">
        <span class="strip-star" aria-hidden="true">✳</span>
      </c:if></c:forEach>
  </div>
</div>
<section id="about" class="section container about-section" data-reveal>
  <div class="about-visual">
    <img
      src="${fn:escapeXml(info.aboutImage)}"
      alt="Blue skies reflected in the village pond beside the temple"
      loading="lazy"
      width="864"
      height="1920"
    /><span class="photo-label"><ui:icon name="pin"/> <c:out value="${info.photoLabel}"/></span>
    <div class="about-stamp">
      <ui:icon name="leaf"/><span>OUR ROOTS<br />RUN DEEP</span>
    </div>
  </div>
  <div class="about-copy">
    <ui:section eyebrow="${info.aboutEyebrow}" title="${info.aboutTitle}" description=""/>
    <p><c:out value="${info.aboutText}"/></p>
    <p><c:out value="${info.aboutSecond}"/></p>
    <div class="about-signature">
      <span lang="hi"><c:out value="${info.hindi}"/></span
      ><small>Our village. Our identity.</small>
    </div>
    <a class="text-link" href="${pageContext.request.contextPath}/gallery">See life in our village <ui:icon name="arrow"/></a>
  </div>
</section>
<div class="container values-row" data-reveal>
  <c:forEach items="${info.values}" var="value">
    <article>
      <span class="value-icon"><ui:icon name="${value.icon}"/></span>
      <div>
        <h3><c:out value="${value.title}"/></h3>
        <p><c:out value="${value.text}"/></p>
      </div>
    </article></c:forEach>
</div>
<section class="section gallery-section" data-reveal>
  <div class="container">
    <div class="section-heading">
      <ui:section eyebrow="${info.gallery.eyebrow}" title="${info.gallery.title}" description="${info.gallery.description}"/><a class="text-link" href="${pageContext.request.contextPath}/gallery">Explore the gallery <ui:icon name="arrow"/></a>
    </div>
    <ui:gallery items="${gallery}" preview="${true}"/>
  </div>
</section>
<section id="videos" class="section container" data-reveal>
  <div class="section-heading">
    <ui:section eyebrow="${info.videos.eyebrow}" title="${info.videos.title}" description="${info.videos.description}"/><a class="text-link" href="${pageContext.request.contextPath}/gallery#videos"
      >Watch all films <ui:icon name="arrow"/></a>
  </div>
  <ui:videos items="${videos}"/>
</section>
<section id="community" class="community-section section" data-reveal>
  <div class="container">
    <div class="section-heading">
      <ui:section eyebrow="${info.community.eyebrow}" title="${info.community.title}" description="${info.community.description}"/><a class="text-link" href="${pageContext.request.contextPath}/#leave-message"
        >Leave a message <ui:icon name="pen"/></a>
    </div>
    <div class="messages-grid"><c:forEach items="${messages}" var="message"><ui:message message="${message}"/></c:forEach><c:if test="${empty messages}"><p class="empty-state">Be the first to leave a little piece of home here.</p></c:if></div>
    <div id="leave-message"><%@ include file="../fragments/message-form.jspf" %></div>
  </div>
</section>
<section class="section container" data-reveal>
  <div class="section-heading"><ui:section eyebrow="${info.stories.eyebrow}" title="${info.stories.title}" description="${info.stories.description}"/><a class="text-link" href="${pageContext.request.contextPath}/blog">All village stories <ui:icon name="arrow"/></a></div>
  <div class="blogs-grid"><c:forEach items="${blogs}" var="blog"><ui:blog blog="${blog}"/></c:forEach><c:if test="${empty blogs}"><p class="empty-state">Our next chapter starts with you. Share a village story.</p></c:if></div>
  <div class="story-invitation">
    <span><ui:icon name="pen"/> <c:out value="${info.storyInvitation}"/></span
    ><a href="${pageContext.request.contextPath}/submit-blog" class="text-link">Write yours <ui:icon name="arrow"/></a>
  </div>
</section>
<section id="contact" class="container contact-wrap" data-reveal>
  <div class="contact-panel">
    <div class="contact-decoration" aria-hidden="true"><ui:icon name="leaf"/></div>
    <div>
      <p class="eyebrow"><c:out value="${info.contact.eyebrow}"/></p>
      <h2><c:out value="${info.contact.title}"/></h2>
      <p><c:out value="${info.contact.text}"/></p>
    </div>
    <div class="contact-actions">
      <app-whatsapp-button><ui:whatsapp floating="${false}"/></app-whatsapp-button><small><c:out value="${info.contactNote}"/></small>
    </div>
  </div>
</section>

<%@ include file="../layout/footer.jspf" %>