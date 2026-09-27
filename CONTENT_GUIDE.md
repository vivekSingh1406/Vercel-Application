# Keeping your village website up to date

Most permanent content changes happen in **`src/app/data/`**. You do not need to search through components.

| What you want to change                                    | File                           |
| ---------------------------------------------------------- | ------------------------------ |
| WhatsApp number, name, social links, message limit         | `src/app/data/site-config.ts`  |
| Hero, introduction, home section headings and contact copy | `src/app/data/village-info.ts` |
| Community messages                                         | `src/app/data/messages.ts`     |
| Village stories                                            | `src/app/data/blogs.ts`        |
| Gallery images, captions, categories and credits           | `src/app/data/gallery.ts`      |
| Video files, titles, descriptions, posters and durations   | `src/app/data/videos.ts`       |
| Theme names and preview swatches                           | `src/app/data/themes.ts`       |
| Theme colors and typography                                | `src/styles.scss`              |

Save your file while `npm start` is running to preview changes. To update a deployed site, run `npm run build` and upload the new production output.

## 1. Set your WhatsApp number once

In `site-config.ts`, change:

```ts
whatsappNumber: '919755752534',
```

Use the real number including its country code, with digits only. For an Indian number, this is `91` followed by the ten-digit phone number. Do not use an example number on the live website. Every contact/submission button uses this one setting.

The website uses `https://wa.me/` links, allowing WhatsApp to choose its mobile app, desktop app, or Web flow. Visitors must confirm sending inside WhatsApp. An unconfigured number leaves drafts safely on the visitor’s device and displays an explanation.

## 2. Add a community message

Add an object to the `MESSAGES` array in `messages.ts`:

```ts
{
  id: 'message-2026-10-01-rahul',
  message: 'Our village is our identity.',
  authorOfMessage: 'Rahul',
  createdAt: '2026-10-01T09:00:00Z',
},
```

Use a unique `id` and a valid date. Only attribute a message to someone with their permission. The initial notes are labeled as journal notes, not real villagers’ testimonials.

The newest messages are kept using `SITE_CONFIG.maxMessages` (initially 5). Sorting uses the actual creation date. Adding a sixth removes the oldest from the local collection. Editing a message retains its original date. Change the limit in one place if you need a different number.

A visitor’s form adds the message locally, then prepares the WhatsApp handoff. It does not update every visitor’s screen.

## 3. Add a reviewed blog

Add an object to the `BLOGS` array in `blogs.ts`:

```ts
{
  id: 'story-2026-10-01',
  title: 'Memories of Gautiyan Tola',
  slug: 'memories-of-gautiyan-tola',
  excerpt: 'A short introduction to the memory you are sharing.',
  content: `Your first paragraph.

Your second paragraph.`,
  author: 'Rahul',
  image: '/media/my-village-photo.jpg',
  createdAt: '2026-10-01',
  category: 'Memories',
},
```

- `slug` becomes the URL: `/blog/memories-of-gautiyan-tola`. Use unique lowercase words separated by hyphens.
- `content` is plain text, not HTML. Separate paragraphs with a blank line.
- `image` is optional; the story card has a fallback image.
- Put a new photo in `public/media/`, then reference it using `/media/filename.jpg`.
- Keep IDs and slugs unique. Dates must be valid ISO dates.
- The three initial stories are starter editorial pieces, not verified village history. Replace or expand them with approved contributions.

## 4. Use visitor submissions

Visitors enter their name, title and story, with an optional JPG/PNG/WebP image under 1.5 MB. A small image is stored with the local draft. Once validated, the form resets and provides a **Continue to WhatsApp** link if the number is configured.

The visitor must press Send in WhatsApp and manually attach the original photograph. Your `/admin` screen cannot see drafts from a visitor’s different device. WhatsApp is the actual delivery channel. Review the story you receive, then add it to `blogs.ts` or your own local workspace for editing and export.

No submission is published automatically. Avoid storing private or sensitive information in a shared browser.

## 5. Add gallery images

Copy your image into `public/media/`. Add an entry to `GALLERY` in `gallery.ts`:

```ts
{
  id: 'photo-harvest-2026',
  src: '/media/harvest-2026.jpg',
  title: 'A season to remember',
  alt: 'Describe what is visible in the photograph',
  category: 'Village life',
  credit: 'Photograph by the contributor’s name',
},
```

The category filters are generated automatically from the data. The first four images appear on the homepage; the full collection appears in `/gallery`. Use meaningful alt descriptions. Landscape photos work well in cards; portrait photos also work in the full-image lightbox. Optimize large photos to approximately 1600–1920 pixels on the long edge and sensible JPEG/WebP quality. Keep original source files separately.

## 6. Add videos

Keep videos in `images/` or `public/media/`. Files in `images/` are served at `/images/`; files under `public/media/` are served at `/media/`.

Add an entry to `VIDEOS` in `videos.ts`:

```ts
{
  id: 'village-film-7',
  title: 'An evening in our village',
  description: 'A short description of this film.',
  src: '/images/evening.mp4',
  poster: '/media/evening-poster.jpg',
  duration: '1:15',
  credit: 'Film by the contributor’s name',
},
```

The first three films appear on the homepage; the gallery automatically shows the full collection. Videos start only after a visitor opens the player. Browser controls offer volume, seeking and fullscreen. Escape closes the dialog and removes the player, stopping playback. Two supplied clips have sideways sections and expose a rotate-view control. Keep original credits and confirm you have permission to publish contributions and any music.

The original source videos include opening effects and captions. Their posters were selected from clear frames later in the clips. `ASSET_INVENTORY.md` lists each original file.

## 7. Change the appearance

Visitors can use the sun icon in the navigation to choose Original, Village Green, Sunset, Earth, Night, or Warm. Their choice persists on their device.

For permanent color changes, open `src/styles.scss`. The beginning of the file contains the six palettes. Their shared variables include:

```css
--color-primary
--color-secondary
--color-background
--color-surface
--color-text
--color-accent
--color-muted
--color-border
--color-card
--color-on-primary
```

Change the corresponding swatch in `data/themes.ts` if you change a palette’s main color. Use contrast-friendly foreground/background pairs. The site uses local system sans-serif fonts and Georgia, so fonts do not depend on external requests. Animations switch off when a visitor requests reduced motion in their device settings.

## 8. Understand the local workspace

Open `/admin`, or use **Content workspace** in the footer.

- **Blogs:** add a story, edit existing stories, generate a URL slug, preview and delete.
- **Messages:** add, edit and delete. The configured newest-message limit applies.
- **Submissions:** review drafts created in this browser. Saving a reviewed draft adds it to this browser’s blog list and removes it from the draft list.
- **Export content:** download a JSON backup of all local messages, stories and drafts.

Deletion asks for confirmation. Export first if you want to preserve anything. This workspace has no password and is deliberately not presented as secure authentication. Anyone with access to the browser can use it. It is useful for preparing content, not controlling a public server.

To publish a local story:

1. Export a backup.
2. Copy the approved entry from the JSON file into `blogs.ts`.
3. Move any image to `public/media/` and replace an exported `data:image/...` value with its `/media/...` path.
4. Run `npm run build` and redeploy the generated website.

## 9. Local storage, clearly explained

All keys are defined once in `site-config.ts`:

| Key                         | Stores                              |
| --------------------------- | ----------------------------------- |
| `gautiyan-tola-messages`    | This browser’s message collection   |
| `gautiyan-tola-blogs`       | This browser’s blog collection      |
| `gautiyan-tola-submissions` | Draft submissions from this browser |
| `gautiyan-tola-theme`       | The selected theme                  |

Components call services; only `StorageService` talks to localStorage. Refreshes never erase data. When saved data is malformed, the application shows baseline content with a warning and leaves the unreadable stored value untouched. A deliberate subsequent save may replace that collection. If storage is blocked or full, the application reports the failure without claiming the content was saved.

A saved local collection takes precedence over later edits to its static file. To preview new baseline data without changing your existing drafts, use another browser/profile or an isolated private window. Private-window content does not persist after closing that window. To deliberately reset a local collection, export it first and remove only that specific key using your browser’s Developer Tools → Application/Storage → Local Storage. The application never performs this reset automatically.

Browser storage is not a permanent backup. Keep exported JSON files somewhere safe. Changes do not synchronize automatically between tabs/devices; reload a tab to see content saved by another tab.

## 10. Moving to a backend later

Keep the content models in `core/models/content.ts`. `ContentRepository` is the replaceable data boundary. Replace its local operations with API calls and update the message/blog services to await requests and expose loading/failure states. Add a server to enforce moderation, retention and access control. Add proper authenticated sessions and server-side authorization for the administrator. Use cloud storage for photographs. The presentation components can continue consuming the same models and services.
