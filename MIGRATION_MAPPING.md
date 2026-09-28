# Historical Angular → current Spring mapping

The Angular source has been removed. MySQL persists stories/drafts/messages. Gallery/video files and metadata are static; uploaded photos are filesystem files with only URLs stored in MySQL.

| Angular implementation                                | Migrated implementation                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Standalone component / route                          | JSP page + PageController mapping                                              |
| BlogService / MessageService                          | ContentService / transactional ContentServiceImpl                              |
| ContentRepository / StorageService domain collections | StoryRepository / MessageRepository + database                                 |
| Blog / BlogSubmission interfaces                      | Story entity with PUBLISHED/DRAFT status; StoryForm / SubmissionForm DTOs      |
| Message interface                                     | CommunityMessage entity / MessageForm DTO                                      |
| GalleryItem / VillageVideo | Plain DTOs + StaticMediaService + static/data/media.json; no database tables |
| HTTP service                                          | None existed; no synthetic REST collection API introduced                      |
| `@for` / `*ngFor`                                     | JSTL `c:forEach`                                                               |
| `@if` / `*ngIf`                                       | JSTL `c:if` / `c:choose`, or browser `hidden` for transient UI state           |
| `{{...}}`                                             | Escaped `c:out` / JSP EL + `fn:escapeXml` in attributes                        |
| Reactive formControlName / ngModel                    | Named HTML controls, MVC @ModelAttribute DTO binding, field errors             |
| Angular form submit                                   | MVC POST with fetch to preserve in-place success and modal interaction         |
| Required/nonBlank/min/max/pattern                     | Jakarta Bean Validation plus equivalent browser validation                     |
| Signals / event bindings                              | Small native JS event handlers for temporary UI state                          |
| RouterLink / fragments                                | Normal MVC URLs and hash anchors                                               |
| localStorage collections                              | JPA/Hibernate persistence; newest-five retention in transaction                |
| localStorage theme                                    | Same key and JSON string format, device preference only                        |
| Hardcoded data | Stories/messages → MySQL seed; gallery/videos → static JSON catalog |
| SCSS/assets                                           | Unmodified CSS source copied to static/css/site.css; copied static media/icons |
| Component-scoped icon CSS                             | static/css/jsp.css                                                             |
| SEO service                                           | MVC title/description/Open Graph model + JSP head                              |
| Toast service                                         | Accessible 6.5-second browser toast                                            |
| WhatsApp service                                      | WhatsAppService encodes the original contact/message/blog/share text           |
| RevealDirective                                       | IntersectionObserver and reduced-motion handling in site.js                    |
| DatePipe / reading-time calculation                   | ContentMapper presentation fields                                              |

## Screens and composition

| Original                          | MVC / JSP / shared elements                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| home/home.ts + home.html          | GET `/` → PageController.home → pages/home.jsp                                                                                        |
| home/hero.ts                      | fragments/hero.jspf                                                                                                                   |
| gallery/gallery-page.ts           | GET `/gallery` → PageController.gallery → pages/gallery.jsp                                                                           |
| gallery/gallery-grid.ts           | gallery.tag + browser filters/lightbox                                                                                                |
| videos/video-section.ts           | videos.tag + native player dialog/rotation/error handling                                                                             |
| blogs/blog-list.ts                | GET `/blog` → PageController.blogs → pages/blog-list.jsp                                                                              |
| blogs/blog-detail.ts              | GET `/blog/{slug}` → PageController.detail → pages/blog-detail.jsp                                                                    |
| messages/message-form.ts          | fragments/message-form.jspf → POST `/messages` → ContentController → ContentService → MessageRepository → community_message           |
| submit-blog/submit-blog.ts + HTML | GET/POST `/submit-blog` → PageController / ContentController → ContentService → StoryRepository → story DRAFT → pages/submit-blog.jsp |
| admin/admin.ts + HTML             | GET `/admin` → PageController.admin → pages/admin.jsp + fragments/admin-story.jspf                                                    |
| Admin story editor/review         | POST `/admin/stories/save` → ContentController → ContentService → StoryRepository → story PUBLISHED                                   |
| Admin message editor              | POST `/admin/messages/save` → ContentController → ContentService → MessageRepository                                                  |
| Confirmed delete                  | POST `/admin/{blog,message,draft}/{id}/delete` → ContentController → ContentService → appropriate repository                          |
| Export                            | GET `/admin/export` → ContentController → ContentService.export → JSON attachment                                                     |
| not-found.ts / missing story      | SiteErrorController `/error`, pages/not-found.jsp; unknown story uses original story empty state, both HTTP 404                       |
| app.html                          | layout/header.jspf + footer.jspf around each page                                                                                     |
| navbar.ts / footer.ts             | common/navbar.jspf / footer.jspf                                                                                                      |
| section-title.ts / icon.ts        | section.tag / icon.tag                                                                                                                |
| blog-card.ts / message-card.ts    | blog.tag / message.tag                                                                                                                |
| whatsapp-button.ts                | whatsapp.tag                                                                                                                          |
| theme-switcher.ts                 | navbar fragment + theme.js / site.js; original six palettes                                                                           |
| modal.ts                          | Shared native-dialog builder in site.js, used for all dialogs                                                                         |
| form-error.ts                     | Inline field-error placeholders + server field-error response                                                                         |

All original navigation URLs and anchors are retained. No sorting UI, pagination, tables, account system, guards, interceptors or chart widgets existed. Those are not invented during migration. Original date ordering, newest-five messages, first-four gallery, first-three home videos/stories, slug normalization, fallback labels/images, plain-text paragraphs and reading-time calculation are preserved.

## Deliberate changes required by persistence

Storage notices now describe shared database saving. Saving a reviewed story publishes it immediately; no Angular data-file rebuild is needed. Draft approval is a single transaction. Admin access can be protected by external credentials, and the production profile requires those credentials. User-entered text is escaped; server-side validation and CSRF protect writes. The server serializes collection changes and checks editor versions, which were unnecessary with a single browser's arrays.

The Angular project and dependencies have been removed. Inert `app-*` HTML wrappers remain solely to preserve existing CSS selectors; they do not load Angular.
