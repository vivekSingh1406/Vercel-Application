import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const base = 'http://127.0.0.1:4200';
await page.goto(base);
await page.getByRole('heading', { level: 1 }).waitFor();
await page.getByRole('button', { name: 'Prepare your message' }).click();
await page.getByText('Your name is required.').waitFor();
for (let i = 0; i < 6; i++) {
  await page.locator('#message-name').fill('Review visitor ' + i);
  await page
    .locator('#community-message')
    .fill('Review message number ' + i + ' from our village.');
  await page.getByRole('button', { name: 'Prepare your message' }).click();
  await page.waitForFunction(() => document.querySelector('#message-name').value === '');
}
let stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gautiyan-tola-messages')));
assert.equal(stored.length, 5);
assert(!stored.some((m) => m.authorOfMessage === 'Review visitor 0'));
await page.reload();
await expect(page.locator('app-message-card')).toHaveCount(5);
console.log('PASS message validation, latest-five retention and refresh persistence');
await page.getByRole('button', { name: 'Choose color theme' }).click();
await page.getByRole('button', { name: 'Night', exact: true }).click();
await page.reload();
await page.getByRole('heading', { level: 1 }).waitFor();
assert.equal(await page.locator('html').getAttribute('data-theme'), 'night');
await page.screenshot({ path: 'artifacts/night-desktop.png' });
await page.getByRole('button', { name: 'Choose color theme' }).click();
await page.getByRole('button', { name: 'Original', exact: true }).click();
await page.keyboard.press('Escape');
console.log('PASS theme persistence');
await page.goto(base + '/gallery');
await page.getByRole('button', { name: 'Nature', exact: true }).click();
await expect(page.locator('.gallery-tile')).toHaveCount(3);
await page.locator('.gallery-tile').first().click();
await expect(page.locator('dialog')).toBeVisible();
await page.getByRole('button', { name: 'Next image' }).click();
await expect(page.locator('#modal-title')).toHaveText('When the village lights up');
await page.keyboard.press('Escape');
await expect(page.locator('dialog')).toHaveCount(0);
assert(
  await page
    .locator('.gallery-tile')
    .first()
    .evaluate((e) => e === document.activeElement),
);
console.log('PASS gallery filters, lightbox navigation, Escape and focus restoration');
await page.locator('.video-card').nth(2).click();
await page.locator('video').evaluate(
  (video) =>
    new Promise((resolve, reject) => {
      if (video.readyState >= 1) return resolve();
      video.addEventListener('loadedmetadata', resolve, { once: true });
      video.addEventListener('error', () => reject(Error('Video load error')), { once: true });
      setTimeout(() => reject(Error('Video metadata timeout')), 15000);
    }),
);
assert((await page.locator('video').evaluate((v) => v.duration)) > 50);
await page.keyboard.press('Escape');
await expect(page.locator('video')).toHaveCount(0);
console.log('PASS original video metadata, playback modal and cleanup');
await page.goto(base + '/blog');
await page.getByRole('searchbox').fill('pond');
await expect(page.locator('app-blog-card')).toHaveCount(1);
await page.locator('.blog-card h3 a').click();
await expect(page).toHaveTitle(/A moment by the pond/);
await expect(page.locator('.article-body>p')).toHaveCount(4);
assert(
  (await page.locator('.article-share a').getAttribute('href')).startsWith('https://wa.me/?text='),
);
console.log('PASS blog search, detail content, SEO and WhatsApp sharing');
await page.goto(base + '/submit-blog');
await page.getByRole('button', { name: 'Prepare my story' }).click();
await page.getByText('Your name is required.').waitFor();
await page.locator('#blog-name').fill('Browser review');
await page.locator('#blog-title').fill('A memory from the browser review');
await page
  .locator('#blog-content')
  .fill('This is a locally saved browser review story. '.repeat(4));
await page.locator('#blog-image').setInputFiles('public/media/village-4.jpg');
await page.locator('.upload-preview').waitFor();
await page.getByRole('button', { name: 'Prepare my story' }).click();
await page.getByText('Your story is saved locally.').waitFor();
assert.equal(await page.locator('#blog-title').inputValue(), '');
await page.reload();
assert.equal(
  await page.evaluate(() => JSON.parse(localStorage.getItem('gautiyan-tola-submissions')).length),
  1,
);
console.log('PASS blog validation, image preview, draft persistence and truthful success state');
await page.goto(base + '/admin');
await page.getByRole('button', { name: 'submissions 1' }).click();
await page.getByRole('button', { name: 'Review & edit' }).click();
await page.getByRole('button', { name: 'Save local story' }).click();
await expect(page.locator('dialog')).toHaveCount(0);
await page.getByRole('button', { name: 'blogs 4' }).click();
await expect(page.getByRole('heading', { name: 'A memory from the browser review' })).toBeVisible();
await page.reload();
await expect(page.locator('.admin-item')).toHaveCount(4);
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Export content' }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), 'gautiyan-tola-content.json');
await page.locator('.admin-item').first().getByRole('button', { name: 'Delete' }).click();
await page.getByRole('button', { name: 'Keep it' }).click();
await expect(page.locator('.admin-item')).toHaveCount(4);
await page.locator('.admin-item').first().getByRole('button', { name: 'Delete' }).click();
await page.getByRole('button', { name: 'Remove locally' }).click();
await expect(page.locator('.admin-item')).toHaveCount(3);
console.log(
  'PASS admin draft review, local publication, refresh persistence, export and confirmed deletion',
);
for (const route of [
  '/gallery',
  '/blog',
  '/blog/a-moment-by-the-pond',
  '/submit-blog',
  '/admin',
  '/missing-page',
]) {
  await page.goto(base + route);
  await page.getByRole('heading', { level: 1 }).waitFor();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      `${route} overflow at ${width}`,
    );
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base);
await page.getByRole('button', { name: 'Toggle navigation' }).click();
await page.locator('#main-nav').getByRole('link', { name: 'Gallery', exact: true }).click();
await expect(page).toHaveURL(/\/gallery$/);
assert.equal(
  await page.getByRole('button', { name: 'Toggle navigation' }).getAttribute('aria-expanded'),
  'false',
);
console.log('PASS all route layouts at 320, 390, 768, 1440 and mobile navigation');
assert.deepEqual(errors, []);
console.log('PASS no browser runtime errors');
await browser.close();
