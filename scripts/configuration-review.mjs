import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const expected = readFileSync('src/app/data/site-config.ts', 'utf8').match(
  /whatsappNumber:\s*'([0-9]+)'/,
)[1];
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage({ reducedMotion: 'reduce' });
await page.goto('http://127.0.0.1:4200/');
await page.locator('app-hero').waitFor();
for (const link of await page.locator('a[href^="https://wa.me/"]').all()) {
  assert.equal(new URL(await link.getAttribute('href')).pathname, '/' + expected);
}
await page.locator('#message-name').fill('Configuration review');
await page.locator('#community-message').fill('Checking the WhatsApp handoff without sending.');
await page.getByRole('button', { name: 'Prepare your message' }).click();
const messageLink = page.getByRole('link', { name: 'Continue to WhatsApp' });
await messageLink.waitFor();
let url = new URL(await messageLink.getAttribute('href'));
assert.equal(url.pathname, '/' + expected);
assert(url.searchParams.get('text').includes('\n\nName:\nConfiguration review'));
for (const [name, id] of [
  ['Village green', 'green'],
  ['Sunset', 'sunset'],
  ['Earth', 'earth'],
  ['Night', 'night'],
  ['Warm', 'warm'],
  ['Original', 'default'],
]) {
  await page.getByRole('button', { name: 'Choose color theme' }).click();
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', id);
  await page.keyboard.press('Escape');
}
await page.goto('http://127.0.0.1:4200/submit-blog');
await page.locator('#blog-name').fill('Configuration review');
await page.locator('#blog-title').fill('A configured WhatsApp story');
await page
  .locator('#blog-content')
  .fill('A village memory prepared for the configured WhatsApp administrator. '.repeat(3));
await page.getByRole('button', { name: 'Prepare my story' }).click();
const blogLink = page.getByRole('link', { name: 'Continue to WhatsApp' });
await blogLink.waitFor();
url = new URL(await blogLink.getAttribute('href'));
assert.equal(url.pathname, '/' + expected);
assert(
  url.searchParams.get('text').includes('New Blog Submission\n\nAuthor:\nConfiguration review'),
);
console.log(
  'PASS all contact, message and blog links use +' +
    expected +
    '; line breaks encoded correctly. No external message sent.',
);
console.log('PASS all six theme palettes apply.');
await browser.close();
