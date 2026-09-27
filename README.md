# Gautiyan Tola (Saman)

A village community website built with Angular 22, standalone components, TypeScript, reactive forms, and custom SCSS. It uses the community’s existing photographs and videos. There is no backend, database, authentication server, or automatic public publishing.

## Run the website

Install a Node version supported by Angular 22. This project was built and checked with Node 26.4.0 and npm 11.17.0. Angular’s compatibility reference: https://angular.dev/reference/versions.

Open a terminal in this folder:

```sh
npm install
npm start
```

Open **http://localhost:4200**. Stop the server with Ctrl+C.

To create the production website:

```sh
npm run build
```

The deployable files are in `dist/gautiyan-tola/browser/`. Upload the entire contents, including `images/` and `media/`, to a static host. Configure that host to serve `index.html` for unknown application paths so `/blog/a-moment-by-the-pond`, `/gallery`, and `/admin` work when opened directly. Do not rewrite missing media requests to HTML. No deployment has been performed.

## First setup

1. Open `src/app/data/site-config.ts`.
2. WhatsApp is configured as **+91 9755752534** (`919755752534`). To change it, edit `whatsappNumber`: country code and digits only, without `+`, spaces, or brackets.
3. Review the starter editorial stories and welcome notes in `blogs.ts` and `messages.ts`. These are not testimonials attributed to real villagers or verified historical accounts.
4. Review the captions, contact copy, and creator credits before publishing.
5. Add genuine social links if desired. Empty social links are hidden.

All contact and submission links use that single configured number. If the number is removed or becomes invalid, the site shows an explanatory message instead of opening an invalid link.

**For everyday content changes, read [CONTENT_GUIDE.md](CONTENT_GUIDE.md).**

## Pages and features

- `/` — village hero, introduction, gallery preview, films, community messages, journal, WhatsApp contact.
- `/gallery` — category filters, keyboard-accessible image lightbox, all six original videos.
- `/blog` — searchable journal.
- `/blog/:slug` — full story, dynamic page title/description, sharing and WhatsApp sharing.
- `/submit-blog` — validated form, optional image preview, persistent local draft, WhatsApp handoff.
- `/admin` — clearly labeled local content workspace: add/edit/delete messages and stories, review local drafts, export JSON.
- Unknown routes — helpful not-found screen.

Six coordinated themes persist across visits. Native dialogs contain keyboard focus, close with Escape, and restore focus. Images below the fold load lazily; original videos load only when a visitor opens a player. Animations respect reduced-motion preferences.

## How content works

Public baseline content lives in `src/app/data/`. A local edit overrides the corresponding collection **in that browser only**. Browser storage survives refreshes and browser restarts unless the person clears site data, uses temporary private browsing, or their browser evicts data. The application never clears storage on startup.

The public submission flow is:

1. Visitor completes and validates a form.
2. A draft/message is saved on their device.
3. Visitor selects **Continue to WhatsApp**, then presses **Send** in WhatsApp.
4. The administrator reviews the actual WhatsApp message.
5. The administrator updates static content and rebuilds/redeploys the website.

Opening WhatsApp is not proof of delivery. Image files cannot be attached through a WhatsApp URL; visitors must attach the original image manually. A local admin preview is not public publication.

## Architecture

```text
src/app/
  core/
    models/             # Typed content models and validators
    services/           # Repository, storage, blog/message, SEO, theme, WhatsApp
  data/                 # Site settings and editable public content
  features/
    home/               # Hero and home composition
    gallery/            # Gallery page, filters and lightbox
    videos/             # Video cards and modal playback
    messages/           # Community message form
    blogs/              # Journal list and detail
    submit-blog/        # Visitor story form
    admin/              # Local content editor
  shared/
    components/         # Navigation, footer, cards, icons, dialog and controls
    directives/         # IntersectionObserver scroll reveal
  app.routes.ts         # Lazy feature routes
src/styles.scss         # Palettes, visual system, layouts and responsive rules
images/                 # Original supplied files; preserved
public/media/           # Small extracted video stills
scripts/                # Asset preparation and browser review utilities
```

The flow is `Component → MessageService/BlogService → ContentRepository → StorageService`. Components never access localStorage. Repository writes report failures; the UI does not announce successful persistence if storage is full or blocked.

For a future backend, retain the content interfaces and components. Replace repository storage operations with asynchronous API methods, adjust service loading/error states, and add real server-side authentication and authorization. Upload images to object storage and store their URLs. Move submission moderation and message retention to the server. Do not use a frontend password as security.

## Media and performance

### Project files and GitHub

All original photos and videos, generated posters, review screenshots, application code, and documentation are included in Git. Only dependencies, build output, caches, logs and local editor/system files are excluded. A fresh clone contains the media needed for playback.

The two largest videos are about 50–53 MiB. GitHub may warn about files over 50 MiB, but each current file is below its 100 MiB per-file limit. Keep future files below that limit or use Git LFS. Install dependencies with `npm install` and generate deployment output with `npm run build`; those generated directories do not need to be committed.

The original media directory is about 199 MiB, mostly video. It is copied to the production build, but videos are not requested on the initial page. The final production build’s initial JavaScript/CSS bundle was about 320 kB raw / 87 kB estimated compressed (feature route chunks and images are additional).

For a bandwidth-limited public host, create compressed H.264/AAC MP4 or WebM copies, keep the originals, and point `videos.ts` at the copies. Retain creator credits. See [ASSET_INVENTORY.md](ASSET_INVENTORY.md) for every original and its use. The optional Swift extraction script requires macOS; running the Angular website does not.

## SEO limitations

The app sets titles, descriptions and Open Graph values when routes load. This frontend-only build is client-rendered. Social crawlers that do not execute JavaScript may see only the generic metadata in `index.html`. Before launch, add your real public domain and absolute Open Graph image URL there. If per-story link previews and crawler-first indexing are required, add build-time prerendering later; that does not require a persistent backend.

## Verification

No unit test cases were created. Production compilation and isolated browser interaction reviews cover responsive layouts, forms, persistence, media dialogs, themes and local management.

With the development server running and Google Chrome installed on macOS:

```sh
node scripts/browser-review.mjs
node scripts/interaction-review.mjs
node scripts/configuration-review.mjs
```

These use a temporary browser context, not your personal Chrome profile. They do not send WhatsApp messages. Screenshots are placed in `artifacts/`. If Chrome is installed elsewhere, change `executablePath` in the scripts. The site itself does not depend on Chrome-specific tooling.
