# Current student-management behavior

The admin-managed flow described in README.md supersedes the original signup/history behavior documented below. Self-registration is disabled. Admins create usernames and passwords at `/admin/exam-center/students`; email is optional. Students can see only the latest attempt per exam, including through direct result/review APIs. Admin profiles and `/admin/exam-center/results` retain complete attempt history. V4 migrates existing accounts and numbers all existing attempts without replacing scores or answers. Deactivation blocks existing sessions and future logins. Admin routes always require ADMIN, including when the configured password is blank.

The historical implementation notes and verification records below describe the earlier version.

# Exam Center implementation

## Existing application analysis

The application is Spring Boot 3.5 / Java 17 with server-rendered JSP/JSTL, plain JavaScript, and the existing CSS theme variables. There is no SPA framework, client-side router, or external state-management library. `PageController` supplies the shared page model, header, navigation, and footer. Existing write controllers return JSON using a `message`/`errors` convention; `site.js` calls them with session CSRF headers.

The existing database is MySQL through Spring Data JPA/Hibernate and the configured datasource. Flyway owns versioned migrations. Existing tables are `story`, `community_message`, `content_lock`, and Flyway's migration history. Spring Security already provides CSRF protection, session-cookie settings, and an ADMIN account for HTTP Basic authentication. There was no registered-user table or learner authentication flow.

This feature extends the same security filter chain, password encoder, datasource, JPA persistence, page controller, layout, and styling. It adds no runtime dependencies. The original content API exception handler remains scoped to content operations; the exam/auth handler follows its JSON error contract and adds meaningful HTTP status codes.

## Files created

- `src/main/java/com/example/application/exam/AuthController.java`: signup, login, current user, and CSRF endpoints.
- `src/main/java/com/example/application/exam/Learner.java` and `LearnerRepository.java`: registered learner accounts.
- `src/main/java/com/example/application/exam/ExamCatalog.java`: validated server-only JSON catalog and safe projections.
- `src/main/java/com/example/application/exam/ExamAttempt.java` and `ExamAttemptRepository.java`: attempts, snapshots, saved answers, and row locks.
- `src/main/java/com/example/application/exam/ExamService.java`: ownership, resume, answer validation, submission, results, review, and history.
- `src/main/java/com/example/application/exam/ExamScoring.java`: decimal marking rules and percentage calculation.
- `src/main/java/com/example/application/exam/ExamController.java`: protected JSON exam API.
- `src/main/java/com/example/application/exam/ExamApiExceptionHandler.java`: validation and safe API errors.
- `src/main/resources/db/mysql/V3__exam_center.sql`: additive database migration.
- `src/main/resources/exams/general-knowledge.json`: 100 starter questions and marking configuration.
- `src/main/webapp/WEB-INF/views/pages/auth.jsp` and `exam.jsp`: shared-layout authentication and exam pages.
- `src/main/resources/static/js/exam.js`: actual API integration, form validation, navigation, save/retry, progress, submit, result, review, history, logout, and session-expiry handling.
- `src/main/resources/static/css/exam.css`: theme-aware responsive exam/auth styles.
- `src/test/java/com/example/application/ExamIntegrationTest.java` and `ExamScoringTest.java`: database/API/security/concurrency and scoring tests.
- `browser-tests/exam.mjs`: real Chrome end-to-end tests.
- `artifacts/exam-review/`: screenshots and browser check results.
- `EXAM_CENTER.md`: implementation and operating guide.

## Files modified

- `SecurityConfig.java`: extends the existing authentication architecture with database learners, session persistence/fixation protection, API authorization, and logout; preserves the existing admin role and Basic authentication.
- `PageController.java`: adds the authentication and protected exam page routes with the existing common model.
- `common/navbar.jspf`: adds Exam Center to the existing responsive navigation.
- `application.properties`: adds optional catalog and session-timeout settings. Earlier startup-fix datasource changes remain intact.
- `AdminSecurityTest.java`: verifies that learner accounts cannot access a protected admin workspace.
- `browser-tests/package.json`: adds `npm run test:exam`.
- `README.md`: links this guide and documents the feature/configuration.

## Database migration

Flyway automatically applies **V3** at application startup. It creates only new tables and indexes; V1/V2 and existing content are unchanged.

| Table | Purpose |
|---|---|
| `exam_user` | UUID, display name, unique normalized email, BCrypt password hash, creation time |
| `exam_attempt` | UUID, owner FK, exam ID/title, ACTIVE/SUBMITTED state, current question, start/submit timestamps, frozen exam/rules JSON, final result JSON |
| `exam_answer` | Composite attempt/question key, selected option, FK to attempt |

Answers and marking rules are snapshotted server-side at attempt creation. Updating the catalog affects new attempts only. Results are persisted at submission. Per-question review marks are derived from that same immutable snapshot. JSON storage avoids new schema migrations when result presentation metadata changes.

A pessimistic lock on the learner serializes attempt creation; a locking active-attempt lookup ensures a current read under MySQL REPEATABLE READ. A lock on the attempt serializes answer updates, position changes, and submission. Starting an existing active exam resumes it. Repeated submission returns 409. Saved answers and positions survive refresh, logout, and server restart.

## API endpoints

All mutation endpoints require the session's CSRF token. `GET /api/auth/csrf` returns `{token, headerName}` for API clients. JSP pages include both values in meta tags. After login, obtain a fresh token because authentication rotates it.

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/api/auth/csrf` | Obtain CSRF token and header name |
| POST | `/api/auth/signup` | Validate name/email/password/confirmation, create learner, return safe user; 201 |
| POST | `/api/auth/login` | Authenticate email/password, rotate session ID and CSRF token, persist Spring Security context |
| GET | `/api/auth/me` | Return authenticated learner's ID/name/email |
| POST | `/api/auth/logout` | Spring Security logout: invalidate session and delete session cookie |
| GET | `/api/exams` | List catalog metadata, without answers |
| GET | `/api/exams/{examId}` | Exam metadata, questions/options, count, and public marking rules |
| POST | `/api/exams/{examId}/start` | Start or resume own active attempt |
| GET | `/api/exams/attempts` | Only the authenticated learner's attempts/results |
| GET | `/api/exams/attempts/{id}` | Own saved state, questions/options, current position, selections; no answer key |
| POST | `/api/exams/attempts/{id}/answers` | Save `{questionId, selectedAnswer}`; `null` clears an answer |
| POST | `/api/exams/attempts/{id}/position` | Save `{currentQuestion}` using a zero-based index |
| POST | `/api/exams/attempts/{id}/submit` | Lock, calculate, and persist final result; no client score is used |
| GET | `/api/exams/attempts/{id}/result` | Own submitted result summary |
| GET | `/api/exams/attempts/{id}/review` | Own submitted answer review, including correct answers |

All exam endpoints and `/api/auth/me` require ROLE_LEARNER. Anonymous API calls receive 401, including anonymous exam POSTs without CSRF. Authenticated requests with missing/invalid CSRF receive 403. Invalid inputs receive 400; missing or another learner's attempt returns the same 404; a completed attempt mutation or premature result/review returns 409. Unexpected errors use a generic 500 message without leaking internals. Unknown client fields such as `marks` or `isCorrect` are ignored and never affect scoring.

Signup requires a name up to 80 characters, a valid email up to 254 characters, and a 10–64 character password containing uppercase, lowercase, and a digit. Passwords must also fit BCrypt's 72-byte limit. Email is stripped/lowercased and unique. Passwords are stored with Spring's delegating BCrypt encoder, never returned. Login uses one generic credential error for both missing accounts and wrong passwords.

## Frontend routes and flow

| Route | Screen |
|---|---|
| `/signup` | Name, email, password and confirmation with frontend/backend validation |
| `/login` | Email/password login and session-expiry messages |
| `/exam-center` | Exam catalog, start/resume, recent attempts, learner name/logout |
| `/exam-center/history` | Own attempts and results |
| `/exam-center/attempts/{id}` | Questions, radio selection, previous/next, numbered navigator, progress and submit |
| `/exam-center/attempts/{id}/result` | Server-provided result summary |
| `/exam-center/attempts/{id}/review` | Options, selected/correct answers, status and marks for every question |

Signup → login → Exam Center → start/resume → answer/save → confirm submit → result → review/history. Protected HTML routes redirect anonymous visitors to login. Login uses the existing Spring Security session and HttpOnly/SameSite cookie; there are no tokens in local storage. Production retains the existing Secure-cookie policy.

The browser keeps the current attempt and selected answers in page memory and persists every change through the API. Controls show saving/submitting states. Navigation and submission wait for answer saving. Failed saves retain the selection and expose Try again. Leaving with an unsaved change triggers a browser warning. Refresh reloads the saved question position and selections from the database. Session expiry redirects to login, preserving the attempt route for return where triggered by the API. There is no trusted scoring in the browser.

## Questions and scoring

The bundled exam has 100 general-knowledge, science, computing, geography, and arithmetic questions. Questions live outside the public static resource directories. To supply a different catalog, replace the JSON file or configure an external file using `EXAM_CATALOG`.

```json
{
  "id": "general-knowledge",
  "title": "General Knowledge Exam",
  "marksPerQuestion": 1,
  "incorrectMarks": 0,
  "unansweredMarks": 0,
  "questions": [
    {"id": 1, "question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "answer": "4"}
  ]
}
```

Catalog loading validates unique positive question IDs, distinct valid options, answer membership, nonempty questions, positive correct marks, nonpositive incorrect marks, and zero unanswered marks. This initial version loads one catalog definition; the browser consumes exam/attempt API projections and does not depend on the JSON file layout, allowing a future database-backed catalog implementation.

- `attempted = correct + incorrect`
- `unanswered = actual question count − attempted`
- `obtainedMarks = correct × marksPerQuestion + incorrect × incorrectMarks`
- `totalMarks = actual question count × marksPerQuestion`
- `percentage = obtainedMarks / totalMarks × 100`, rounded HALF_UP to two decimals

BigDecimal calculations support fractional positive marks and negative incorrect marks. Negative percentages are retained if negative marking is configured. No calculation assumes exactly 100 questions.

## Configuration and startup

No new service or dependency is required. The existing Java/Maven/MySQL setup remains sufficient.

| Variable | Default / purpose |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Existing datasource; same database as the original site |
| `EXAM_CATALOG` | `classpath:exams/general-knowledge.json`; use `file:/absolute/path/exam.json` for an external catalog |
| `SESSION_TIMEOUT` | `30m`; inactive sessions expire, but attempts remain saved |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Existing admin credentials/behavior; learner signup never grants ADMIN |
| `SPRING_PROFILES_ACTIVE=production` | Existing production configuration requires admin password and HTTPS/Secure cookies |

Run `mvn spring-boot:run`, then open `/exam-center`. Or run `mvn -DskipTests package` and `java -jar target/gautiyan-tola.war`. Flyway installs V3 on startup. A server restart requires login again because sessions use the existing servlet container, while account/attempt data remains in MySQL. Multi-instance hosting needs sticky sessions or a shared session store before load balancing authenticated traffic.

## Testing

Use a **separate disposable MySQL database**. The existing regression tests expect the original seed data, and browser tests mutate their database. Do not point tests at the application database.

```sh
TEST_DB_URL='jdbc:mysql://127.0.0.1:3307/exam_center_test' \
TEST_DB_USERNAME=exam_test TEST_DB_PASSWORD=exam-test-only mvn verify

# In another terminal, run the app against the disposable database:
DB_URL='jdbc:mysql://127.0.0.1:3307/exam_center_test' \
DB_USERNAME=exam_test DB_PASSWORD=exam-test-only PORT=8081 \
mvn spring-boot:run

cd browser-tests
EXAM_TEST_URL=http://127.0.0.1:8081 npm run test:exam
```

The browser harness requires the existing Playwright dependency and Chrome. `CHROME_PATH` selects another installed Chromium-compatible binary. The existing `npm test` content regression harness expects an isolated server with `ADMIN_PASSWORD` empty, matching its original setup.

Verification results are recorded after the final run below. The suite covers hashing, validation, duplicate email, login/session ID rotation/logout, CSRF, anonymous protection, private catalog files, question/option validation, saved answers/position, clearing answers, active-attempt resume, cross-user authorization, review gating, spoofed client scores, duplicate submission, completed-attempt immutability, simultaneous start/submit, history, and all-correct/all-incorrect/mixed/unanswered/decimal/negative scoring. Browser tests exercise the actual database APIs, responsive layouts, network failure/retry, confirmation/cancel, refresh, review, and session expiry.

### Final verification results

- **26 Maven tests passed**, zero failures/errors/skips, with `mvn -o verify` against disposable MySQL 8.4. The executable WAR built successfully.
- **19 exam browser check groups passed against the packaged WAR**, with zero JavaScript errors. Screenshots cover widths 390, 768, and 1440; no horizontal overflow was found.
- **9 existing browser regression groups passed**: original routes/layouts; message validation/save/retention; themes; gallery/lightbox/video; search/article/share; upload serving; draft/review/edit/export/delete; admin message CRUD; responsive navigation/resources.
- The original browser regression run's tracked screenshots were restored after verification to avoid unrelated artifact changes. Exam screenshots and machine-readable browser results are in `artifacts/exam-review/`.
- Flyway V3 successfully applied to the configured application database on startup. The final WAR started on port 8080. Integration/browser test accounts and answer data were created only in the disposable test database.

The custom login explicitly saves Spring Security's context and applies session authentication strategy, following [Spring Security 6.5 session management guidance](https://docs.spring.io/spring-security/reference/6.5/servlet/authentication/session-management.html).

### Authentication regression fix

The first successful admin authentication erased credentials on a reused Spring Security `User` instance. Subsequent Basic-auth requests therefore passed an empty stored credential to `DelegatingPasswordEncoder`, causing HTTP 500 errors. The admin hash is now retained separately and each user lookup constructs a fresh principal; credential erasure remains enabled. No plaintext-password fallback or database password rewrite was added.

HTTP Basic credentials are interpreted only on `/admin` and `/admin/**`. Browsers can keep sending cached admin headers on the whole site, so ignoring those headers on public and learner routes prevents them from replacing learner session authentication.

Added `src/test/java/com/example/application/config/SecurityConfigTest.java` and `browser-tests/auth-regression.mjs`; expanded `AdminSecurityTest` and `ExamIntegrationTest`. Run the new browser checks with `npm run test:auth` against a disposable server with `ADMIN_PASSWORD=integration-test-only` (or supply `TEST_ADMIN_PASSWORD` to the test harness).

Latest verification: **30 Maven tests passed**, executable WAR built, **19 exam browser checks passed**, and **5 authentication browser checks passed** with no HTTP 500 responses or JavaScript errors. Direct SQL confirmed BCrypt user records, saved answers, and stored submitted results with 0%, 1%, and 100% scores. The restarted application on port 8080 passed 12 repeated/concurrent authenticated admin and asset requests, public signup/login/home checks, and anonymous exam-API rejection. The tests initially reproduced the exact password-encoder exception before the fix.
