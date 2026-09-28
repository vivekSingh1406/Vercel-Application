# MySQL schema and static media

MySQL is the only configured database. Flyway runs `db/mysql/V1__schema.sql` and `V2__original_content.sql`; Hibernate uses `ddl-auto=validate`. V2 seeds the original three published stories and three editorial messages once. No gallery or video tables are created.

Domain tables use InnoDB and utf8mb4 with case/accent-sensitive collation. Java timestamps are stored as UTC `datetime(6)` with microsecond precision. Connections and Hibernate use UTC; browser dates retain visitor-local display behavior. `date_only` preserves the original stories' calendar dates.

## Tables

| Table | Columns | Constraints/indexes |
|---|---|---|
| story | id varchar(64), title varchar(140), slug varchar(512), excerpt varchar(300), content text, author varchar(80), image varchar(4096) nullable, image_name varchar(255) nullable, category varchar(255) nullable, created_at datetime(6), status varchar(16), published_slug varchar(512) nullable, date_only boolean, version bigint | id PK; published_slug UNIQUE; status DRAFT/PUBLISHED; published_slug must equal slug for published records and be NULL for drafts; index(status,created_at) |
| community_message | id varchar(64), message varchar(600), author_of_message varchar(80), created_at datetime(6), version bigint | id PK; index(created_at); newest five retained in a transaction |
| content_lock | id integer | id PK; one seeded row serializes collection mutations across application instances |

Unmarked columns are NOT NULL. IDs retain existing seed identifiers or use UUIDs for new records. `version` supports optimistic edit checks. Draft publication changes the story status in one transaction. Authors and categories remain free text; no user/category foreign keys are invented.

Flyway additionally manages its own `flyway_schema_history` metadata table.

## Static media — outside MySQL

- `static/data/media.json`: six gallery entries and six video entries with all captions, categories, paths, durations and credits; array order controls presentation.
- `static/media/` and `static/images/`: all original photos/posters/video binaries.
- `GalleryItem` and `VillageVideo`: plain DTOs loaded by `StaticMediaService`; no JPA annotations or repositories.
- Uploaded story photos: files in `UPLOAD_DIR`, served at `/uploads/{generated-name}`. `story.image` stores only their URL; it never contains binary/base64 image data. `image_name` is the original filename for the WhatsApp handoff.
- Themes, navigation, site copy and UI state are not database tables.

Back up MySQL and the upload directory together. Static assets/catalog are versioned source files. The migrations initialize an empty MySQL schema rather than attempting to rewrite an older development database.
