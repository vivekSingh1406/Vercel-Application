import { chromium } from '@playwright/test';
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:4200/', { waitUntil: 'networkidle' });
for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 700) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(80);
}
await page.waitForLoadState('networkidle');
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
await page.screenshot({ path: 'artifacts/home-desktop-viewport.png' });
console.log(
  JSON.stringify({
    title: await page.title(),
    h1: await page.locator('h1').innerText(),
    errors,
    images: await page
      .locator('img')
      .evaluateAll((imgs) =>
        imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
      ),
  }),
);
for (const width of [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  console.log(
    JSON.stringify({
      width,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    }),
  );
}
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
await page.screenshot({ path: 'artifacts/home-mobile-viewport.png' });
await browser.close();
