# Migration report — corrected root project

## Requested corrections

- The Spring Boot project is directly in `Vercel-Application`: `pom.xml`, `src/`, configuration and documentation are at the repository root. There is no nested `spring-boot-application` directory.
- The Angular project, source, build configuration, dependencies and obsolete scripts have been removed.
- Gallery/video metadata is now `src/main/resources/static/data/media.json`, loaded by `StaticMediaService`. Original images/videos remain static files. Their entity classes became plain DTOs; their JPA repositories and tables were removed.
- Uploaded story photos are stored in `UPLOAD_DIR` and served as static resources. MySQL stores only the image URL and original filename, never image bytes/base64.
- MySQL Connector/J and Flyway's MySQL module replace the previous database drivers. MySQL-specific migrations use InnoDB, utf8mb4 and UTC `datetime(6)` timestamps.
- The supplied `jdbc:mysql://localhost:3306/indore`, root account and driver are configured. The supplied password is in ignored, user-readable-only `application-local.properties`; environment variables can override it.

## Implementation

**Pages:** home, gallery, journal list, story detail, story submission, content workspace and friendly not-found/error screens. Original routes, CSS, media, icons, themes, dialogs, navigation and workflows are preserved.

**Controllers:** PageController, ContentController, SiteErrorController.

**Services:** ContentService/ContentServiceImpl for persisted business content; StaticMediaService for the filesystem catalog; ImageStorageService for file uploads; WhatsAppService for handoff/share links.

**Repositories/entities:** StoryRepository/Story, MessageRepository/CommunityMessage, ContentLockRepository/ContentLock. Domain tables are `story`, `community_message` and `content_lock`; Flyway additionally maintains `flyway_schema_history`. No gallery/video persistence exists.

**Views:** seven JSP pages with reusable layout/navigation/footer/hero/message/admin fragments and icon/section/card/gallery/video/WhatsApp tags. Browser JavaScript supplies transient interactions; JPA owns persistent writes.

## Verification

- `mvn clean verify` at repository root passed: **9 tests, 0 failures, 0 errors**.
- Integration tests ran against an isolated **real MySQL 9.7.1** server, not an embedded substitute. Fresh migrations, repeated startup/schema validation, form validation, story/message CRUD, duplicate slugs, atomic draft publication, newest-five retention, export, CSRF and optional admin authentication passed.
- Database metadata tests assert the gallery/video tables are absent.
- Upload tests check that the database contains a `/uploads/...` URL and the filesystem contains the uploaded bytes.
- The root-built executable WAR started on Java 17 with MySQL and compiled/rendered its JSP pages.
- Browser regression passed: every route, responsive layouts, MySQL-backed forms/CRUD, all six themes, gallery filtering/lightbox, all six videos, search, draft review, export, delete confirmation, and filesystem photo loading. No browser exceptions or broken media/CSS/JS resources were observed. Results are under `artifacts/mysql-review/`; the standalone runner is `browser-tests/review.mjs` and needs no Angular server.
- Historical Angular/JSP comparison screenshots remain under `artifacts/` as reference evidence, not an Angular project/runtime. The earlier layout comparisons matched except for storage-related admin notice wording. Those historical results are separate from the current MySQL test run.

The installed MySQL 9.7 server is newer than the bundled Flyway module's declared tested versions; Flyway prints a compatibility advisory, but both migrations and schema validation succeeded. Certify your deployment against its actual MySQL version.

## Supplied indore connection

The read-only connection check using the supplied credentials returned:

```text
Access denied for user 'root'@'localhost' (using password: YES)
```

No tables or account settings in `indore` were modified. Correct the MySQL account/password (or override `DB_PASSWORD`) before launching against that database. This is distinct from the successful tests against the disposable localhost:3307 MySQL server. The local password file is excluded from Git; the example file contains only a placeholder.

## Running and maintenance

See [README.md](README.md) for account verification, setup, root-level build/start commands and tests. See [DATABASE_DESIGN.md](DATABASE_DESIGN.md) for the MySQL schema and [MIGRATION_MAPPING.md](MIGRATION_MAPPING.md) for screen mappings.

Back up MySQL together with `UPLOAD_DIR`. Static photos/videos and their JSON catalog are versioned source files. These migrations initialize a new MySQL schema; they do not convert an older database automatically. No deployment, existing database migration, account reset or external WhatsApp message was performed.
