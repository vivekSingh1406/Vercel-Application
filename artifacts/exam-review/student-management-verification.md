# Exam Center student management verification

Verified on 2 October 2026 against the isolated MySQL `exam_center_test` database.

- 32 Maven tests passed with no failures or errors.
- Flyway migrations V1–V4 applied successfully on MySQL.
- 8 student-management browser checks passed: admin creation/profile, username login, separate retakes, latest-only results, admin authorization, complete history/answer review, search/filter/sort, and deactivation.
- 17 existing exam browser checks passed, including scoring, persisted progress, network retry, responsive layouts, cross-user isolation, and session expiry.
- 5 authentication browser checks passed, including repeated Basic authentication and cached admin headers alongside student sessions.
- Executable WAR packaging passed.
- Student-management browser checks confirmed no page overflow at 390, 768, and 1440 pixels.

Public self-registration is disabled. Password hashes are not returned in APIs. Deactivation preserves attempts and rejects existing student sessions. Existing catalog scoring has no pass/fail threshold.

Browser reports: `student-management.json`, `results.json`, and `auth-regression.json` in this directory.
