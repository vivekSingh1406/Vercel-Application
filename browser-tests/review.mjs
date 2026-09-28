import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base = process.env.MIGRATION_URL || "http://127.0.0.1:8080";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage(),
  errors = [],
  badResources = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400 && /\.(css|js|jpg|jpeg|svg|mp4)(\?|$)/.test(r.url()))
    badResources.push([r.status(), r.url()]);
});
const artifacts = "../artifacts/mysql-review";
mkdirSync(artifacts, { recursive: true });
try {
  // Exercise the standalone JSP application before mutating test content.
  const geometries = [];
  for (const [name, path] of [
    ["home", "/"],
    ["gallery", "/gallery"],
    ["journal", "/blog"],
    ["article", "/blog/a-moment-by-the-pond"],
    ["submission", "/submit-blog"],
    ["admin", "/admin"],
    ["not-found", "/missing-page"],
  ]) {
    for (const width of [390, 1440]) {
      for (const [app, url] of [
        ["jsp", base],
      ]) {
        await page.setViewportSize({
          width,
          height: width === 390 ? 844 : 1000,
        });
        const response = await page.goto(url + path);
        await page.locator("h1").waitFor();
        if (app === "jsp")
          assert.equal(response.status(), path === "/missing-page" ? 404 : 200);
        await page.evaluate(async () => {
          for (const image of document.images) {
            image.loading = "eager";
          }
          await Promise.all(
            [...document.images].map((i) => i.decode().catch(() => {})),
          );
        });
        await page.screenshot({
          path: `${artifacts}/${name}-${width}-${app}.png`,
          fullPage: true,
        });
        const geometry = await page
          .locator(
            "h1,.hero,.about-section,.gallery-grid,.video-grid,.messages-grid,.blogs-grid,.site-footer,.submission-layout",
          )
          .evaluateAll((nodes) =>
            nodes.map((n) => {
              const r = n.getBoundingClientRect();
              return {
                selector: n.className || n.tagName,
                x: r.x,
                y: r.y,
                w: r.width,
                h: r.height,
              };
            }),
          );
        geometries.push({ name, width, app, geometry });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `${app} ${path} overflow ${width}`,
        );
      }
    }
  }
  writeFileSync(
    `${artifacts}/geometry.json`,
    JSON.stringify(geometries, null, 2),
  );
  console.log(
    "PASS every route, desktop/mobile layouts, screenshots",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.getByRole("button", { name: "Prepare your message" }).click();
  await expect(
    page.getByText("Your name is required.", { exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await page.locator("#message-name").fill("Review visitor " + i);
    await page
      .locator("#community-message")
      .fill("Review message number " + i + " from our village.");
    await page.getByRole("button", { name: "Prepare your message" }).click();
    await expect(page.locator("#message-name")).toHaveValue("");
  }
  await expect(page.locator("app-message-card")).toHaveCount(5);
  await expect(page.locator("app-message-card").first()).toContainText(
    "Review visitor 5",
  );
  await expect(page.locator(".messages-grid")).not.toContainText(
    "Review visitor 0",
  );
  const link = page.getByRole("link", { name: "Continue to WhatsApp" });
  let url = new URL(await link.getAttribute("href"));
  assert.equal(url.pathname, "/919755752534");
  assert(url.searchParams.get("text").includes("\n\nName:\nReview visitor 5"));
  await page.reload();
  await expect(page.locator("app-message-card")).toHaveCount(5);
  console.log(
    "PASS message validation, database save, newest-five retention, refresh and WhatsApp handoff",
  );
  for (const [name, id] of [
    ["Village green", "green"],
    ["Sunset", "sunset"],
    ["Earth", "earth"],
    ["Night", "night"],
    ["Warm", "warm"],
    ["Original", "default"],
  ]) {
    await page.getByRole("button", { name: "Choose color theme" }).click();
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", id);
    await page.keyboard.press("Escape");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", id);
  }
  console.log("PASS all six themes and persistence");
  await page.goto(base + "/gallery");
  await page.getByRole("button", { name: "Nature", exact: true }).click();
  await expect(page.locator(".gallery-tile:visible")).toHaveCount(3);
  await page.locator(".gallery-tile:visible").first().click();
  await page.getByRole("button", { name: "Next image" }).click();
  await expect(page.locator("#modal-title")).toHaveText(
    "When the village lights up",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#modal-title")).toHaveText(
    "Still waters, open skies",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
  assert(
    await page
      .locator(".gallery-tile:visible")
      .first()
      .evaluate((e) => e === document.activeElement),
  );
  for (let i = 0; i < 6; i++) {
    await page.locator(".video-card").nth(i).click();
    await expect(page.locator("video")).toHaveJSProperty("readyState", 4, {
      timeout: 30000,
    });
    assert(await page.locator("video").evaluate((v) => v.duration > 0));
    if (i >= 4) {
      await page.getByRole("button", { name: "Rotate view" }).click();
      await expect(page.locator(".video-player")).toHaveClass(/rotated/);
    }
    await page.keyboard.press("Escape");
    await expect(page.locator("video")).toHaveCount(0);
  }
  console.log(
    "PASS gallery filtering, lightbox keyboard/focus, all six video files, rotation and cleanup",
  );
  await page.goto(base + "/blog");
  await page.getByRole("searchbox").fill("  POND ");
  await expect(page.locator("app-blog-card:visible")).toHaveCount(1);
  await page.locator(".blog-card:visible h3 a").click();
  await expect(page).toHaveTitle(/A moment by the pond/);
  await expect(page.locator(".article-body>p")).toHaveCount(4);
  await expect(page.locator(".article-byline")).toContainText("1 min read");
  assert(
    (await page.locator(".article-share a").getAttribute("href")).startsWith(
      "https://wa.me/?text=",
    ),
  );
  console.log("PASS search, article content, reading time, SEO, share URL");
  await page.goto(base + "/submit-blog");
  await page.getByRole("button", { name: "Prepare my story" }).click();
  await expect(
    page.getByText("Your name is required.", { exact: true }),
  ).toBeVisible();
  await page.locator("#blog-name").fill("Browser review");
  await page.locator("#blog-title").fill("A memory from the browser review");
  await page
    .locator("#blog-content")
    .fill("This is a database-backed browser review story. ".repeat(4));
  await page.locator("#blog-image").setInputFiles("../src/main/resources/static/media/village-4.jpg");
  await expect(page.locator(".upload-preview")).toBeVisible();
  await page.getByRole("button", { name: "Prepare my story" }).click();
  await expect(
    page.getByText("Your story is saved for review.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#blog-title")).toHaveValue("");
  url = new URL(
    await page
      .getByRole("link", { name: "Continue to WhatsApp" })
      .getAttribute("href"),
  );
  assert(
    url.searchParams.get("text").includes("please attach manually in WhatsApp"),
  );
  await page.goto(base + "/admin");
  await page.getByRole("button", { name: /submissions/ }).click();
  await page
    .getByRole("button", { name: "Review & edit", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Save story", exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: /blogs/ }).click();
  await expect(page.locator(".admin-item:visible")).toHaveCount(4);
  const uploadedPhoto = page.locator('.admin-item:visible img[src^="/uploads/"]');
  await expect(uploadedPhoto).toHaveCount(1);
  await expect.poll(() => uploadedPhoto.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  const uploadedResponse = await page.request.get(new URL(await uploadedPhoto.getAttribute("src"), base).href);
  assert.equal(uploadedResponse.status(), 200);
  assert.match(uploadedResponse.headers()["content-type"], /image\/jpeg/);
  console.log("PASS uploaded photo served from filesystem URL");
  const item = page.locator(".admin-item:visible").filter({
    has: page.getByRole("heading", {
      name: "A memory from the browser review",
      exact: true,
    }),
  });
  await item.getByRole("button", { name: "Edit", exact: true }).click();
  await page.locator("#admin-title").fill("Edited browser review story");
  await page.getByRole("button", { name: "Save story", exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Edited browser review story" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export content" }).click();
  assert.equal(
    (await download).suggestedFilename(),
    "gautiyan-tola-content.json",
  );
  const edited = page.locator(".admin-item:visible").filter({
    has: page.getByRole("heading", {
      name: "Edited browser review story",
      exact: true,
    }),
  });
  await edited.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Keep it", exact: true }).click();
  await expect(page.locator(".admin-item:visible")).toHaveCount(4);
  await edited.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(page.locator(".admin-item:visible")).toHaveCount(3);
  console.log(
    "PASS photo draft save, review/publication, edit persistence, export, cancel and confirm deletion",
  );
  await page.getByRole("button", { name: /messages/ }).click();
  await page
    .getByRole("button", { name: "+ Add message", exact: true })
    .click();
  await page.locator("#admin-message-name").fill("Admin test");
  await page
    .locator("#admin-message")
    .fill("A message from the content workspace.");
  await page.getByRole("button", { name: "Save message", exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await expect(page.locator(".admin-item:visible")).toHaveCount(5);
  const message = page.locator(".admin-item:visible").filter({
    has: page.getByRole("heading", { name: "Admin test", exact: true }),
  });
  await message.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .locator("#admin-message")
    .fill("An edited message from the workspace.");
  await page.getByRole("button", { name: "Save message", exact: true }).click();
  await expect(message).toContainText("An edited message");
  await message.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(page.locator(".admin-item:visible")).toHaveCount(4);
  console.log("PASS message admin create/edit/delete");
  for (const path of [
    "/",
    "/gallery",
    "/blog",
    "/submit-blog",
    "/admin",
    "/missing-page",
  ]) {
    await page.goto(base + path);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${path} overflow at ${width}`,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .locator("#main-nav")
    .getByRole("link", { name: "Gallery", exact: true })
    .click();
  await expect(page).toHaveURL(/\/gallery$/);
  await expect(
    page.getByRole("button", { name: "Toggle navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
  assert.deepEqual(errors, []);
  assert.deepEqual(badResources, []);
  console.log(
    "PASS responsive routes, mobile navigation, no browser errors or broken resources",
  );
  writeFileSync(
    `${artifacts}/browser-results.json`,
    JSON.stringify({ passed: true, errors, badResources }, null, 2),
  );
} finally {
  await browser.close();
}
