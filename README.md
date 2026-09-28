# Gautiyan Tola — Spring Boot / JSP / MySQL

Java 17+, Spring Boot 3.5.16, Spring MVC, JSP/JSTL, Spring Data JPA/Hibernate, Flyway and **MySQL**. The Angular project, dependencies and build configuration have been removed. The existing UI, navigation, SVG icons, styles and media are preserved.

## Configured database and startup

The application is directly in `Vercel-Application`: `pom.xml`, `src/`, and these documents are at the repository root.

The workspace uses the supplied MySQL configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/indore
spring.datasource.username=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

The supplied password is saved only in root-level `application-local.properties`, which is excluded from Git and restricted to the local user. Spring imports it automatically when launched from this directory. `DB_PASSWORD` overrides it. Do not commit that file. On a fresh checkout, copy `application-local.properties.example` to `application-local.properties` and fill in your own password, or supply `DB_PASSWORD` through the environment.

The connection check with the supplied credentials returned **Access denied for root@localhost**. The configuration was saved exactly as requested; the MySQL account/password must be corrected before this workspace can connect to `indore`. No tables or account settings in that database were changed. To verify your account interactively without putting a password on the command line:

```sh
mysql -h localhost -P 3306 -u root -p indore
```

Use MySQL 8.4+ and an empty application schema (or one already initialized by these migrations). If `indore` does not yet exist, create it using a valid database administrator account:

```sql
CREATE DATABASE IF NOT EXISTS indore CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs;
```

From `Vercel-Application`, once the credentials are accepted:

```sh
mvn -DskipTests clean package
java -jar target/gautiyan-tola.war
```

Open http://127.0.0.1:8080. MySQL is required; there is no embedded-database fallback. Flyway's MySQL migrations under `src/main/resources/db/mysql` create the schema and seed the three original stories and three editorial welcome notes once. Hibernate validates the schema; restarting does not reinsert deleted records.

The executable WAR includes Tomcat and JSP support. Deploy at root context (`/`), matching the original asset URLs. Requirements are JDK 17+ and Maven 3.6.3+. The configured UTC connection properties preserve timestamps without changing the supplied JDBC URL.

## Where images and videos live

| Content | Location | Database storage |
|---|---|---|
| Original videos and original gallery photo | `src/main/resources/static/images/` | None |
| Gallery photos, video posters, hero/about photos | `src/main/resources/static/media/` | None |
| Gallery/video titles, categories, captions, paths, credits, durations and ordering | `src/main/resources/static/data/media.json` | None |
| Site/page copy and theme labels | `src/main/resources/site.json` | None |
| Visitor-uploaded story photos | `UPLOAD_DIR` (default `./uploads/`), served at `/uploads/...` | URL and original filename only, never image bytes/base64 |

To add a gallery photo or video, copy the file into the relevant static directory and add its entry to `static/data/media.json`. Array order determines display order. The homepage uses the first four photos and first three videos; `/gallery` shows all. Keep the existing `v2` entry for the hero's film and IDs `v5`/`v6` for the existing rotate controls. Rebuild/restart after static catalog changes.

Uploaded photos are validated as JPEG/PNG/WebP up to 1,500,000 bytes, assigned server-generated filenames and written atomically. Legacy data-image values entered in the story editor are converted to files before saving. Back up `UPLOAD_DIR` together with MySQL, and mount it as persistent storage when deploying. Story deletion does not automatically delete image files because URLs may be reused; remove unreferenced uploads only after checking references/backups.

The original CSS remains in `static/css/site.css`; `jsp.css` contains only host/hidden-state and Spring form adaptations. No Angular runtime is loaded. The remaining `app-*` HTML wrappers are inert elements used by the original CSS.

## Configuration

| Environment variable | Default / purpose |
|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/indore` |
| `DB_USERNAME` | root |
| `DB_PASSWORD` | Overrides the password in ignored `application-local.properties`; required when no local file exists |
| `UPLOAD_DIR` | `./uploads/`; use an absolute path or persistent volume for deployment |
| `PORT` | 8080 |
| `SERVER_ADDRESS` | 127.0.0.1; production profile defaults to 0.0.0.0 |
| `WHATSAPP_NUMBER` | Original configured number, 919755752534; blank/invalid disables the handoff |
| `ADMIN_USERNAME` | admin |
| `ADMIN_PASSWORD` | Empty preserves the original local open workspace; setting it protects `/admin` and `/admin/**` with HTTP Basic |
| `SPRING_PROFILES_ACTIVE` | Set `production` for deployment; MySQL is already the default |

Production requires a nonempty `ADMIN_PASSWORD` and uses Secure session cookies. Use HTTPS at the reverse proxy. Credentials belong in environment variables or a secret manager. CSRF protection is enabled in all modes. Public pages/submission forms remain public; configured admin authentication protects editing, review, deletion and export.

## Workflows

- `/`: validated community messages, newest-five retention, original gallery/video/story previews.
- `/gallery`: static catalog, category filters, keyboard lightbox, all six original video players and rotation.
- `/blog` and `/blog/{slug}`: searchable MySQL-backed stories, reading time, share actions and metadata.
- `/submit-blog`: save a draft to MySQL with an optional filesystem photo; drafts remain unpublished until reviewed.
- `/admin`: add/edit/delete messages and stories, review/publish drafts, generate unique slugs, preview and export JSON. Atomic publication and record versions protect edits.
- WhatsApp remains a separate user-confirmed action. Images must be attached manually; the application sends no external messages automatically.

## Tests

Tests use **real MySQL**, not an in-memory substitute. Create a separate empty `village_test` database and grant your test account schema privileges on it. Never point tests at a live database.

```sh
export TEST_DB_URL='jdbc:mysql://127.0.0.1:3306/village_test?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true'
export TEST_DB_USERNAME=village
export TEST_DB_PASSWORD='your-test-database-password'
mvn clean verify
```

`TEST_UPLOAD_DIR` defaults to `./target/test-uploads`. The test profile overrides the application database settings. Integration writes are rolled back; seed/count tests expect the original seed dataset.

Optional Chrome browser tests are in `browser-tests/`; their package files contain Playwright only. Start the WAR against another disposable MySQL database with the seed content, then:

```sh
cd browser-tests
npm ci
npm test
```

`MIGRATION_URL` selects the running server (default http://127.0.0.1:8080), and `CHROME_PATH` overrides the installed Chrome path. Tests mutate disposable content and save screenshots under `artifacts/mysql-review/`. Node is used only for these optional tests, never to build/run the Java application.

## Migration notes

The previous development version's embedded/PostgreSQL configuration and gallery/video persistence have been removed. These MySQL migrations initialize a new MySQL schema; they do not convert an existing database in place. No existing external database was modified during this revision. Export any content from an earlier running version before retiring it. Original browser-local records were never available in the source repository and are not silently imported.

See [DATABASE_DESIGN.md](DATABASE_DESIGN.md), [MIGRATION_MAPPING.md](MIGRATION_MAPPING.md), and [MIGRATION_REPORT.md](MIGRATION_REPORT.md). [APPLICATION_INVENTORY.md](APPLICATION_INVENTORY.md) records the original pre-migration source inventory; its referenced Angular paths are historical, not files required by this application.

Technical references: [Flyway MySQL support](https://documentation.red-gate.com/fd/mysql-277579322.html), [Connector/J timezone configuration](https://dev.mysql.com/doc/connector-j/en/connector-j-connp-props-datetime-types-processing.html).
