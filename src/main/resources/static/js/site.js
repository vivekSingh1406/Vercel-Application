"use strict";
(() => {
  const $ = (s, root = document) => root.querySelector(s),
    $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const paths = {
    menu: "M4 6h16M4 12h16M4 18h16",
    rotate: "M20 8A8 8 0 1 0 20 16M20 3v5h-5",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    back: "M20 12H4m6-6-6 6 6 6",
    close: "m6 6 12 12M18 6 6 18",
    chat: "M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5ZM8 11h8m-8 4h5",
  };
  function icon(name) {
    const wrapper = el("app-icon"),
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    for (const [key, value] of Object.entries({
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.6",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    }))
      svg.setAttribute(key, value);
    path.setAttribute("d", paths[name] || paths.arrow);
    svg.append(path);
    wrapper.append(svg);
    return wrapper;
  }
  // Angular DatePipe uses the visitor's timezone. Keep that behavior after SSR.
  function localDate(value, style = "medium") {
    return new Intl.DateTimeFormat(
      "en-US",
      style === "datetime"
        ? { dateStyle: "medium", timeStyle: "medium" }
        : { dateStyle: style },
    ).format(new Date(value.length === 10 ? value + "T00:00:00" : value));
  }
  function localizeDates() {
    $$("[data-date]").forEach((n) => {
      n.textContent = localDate(
        n.dataset.date,
        n.dataset.dateStyle || "medium",
      );
    });
  }
  localizeDates();
  let toastTimer;
  function toast(message) {
    const region = $(".toast-region");
    if (!region) return;
    region.replaceChildren();
    const box = el("div", "toast"),
      close = el("button", "icon-button");
    close.setAttribute("aria-label", "Dismiss notification");
    close.append(icon("close"));
    close.onclick = () => box.remove();
    box.append(icon("chat"), el("span", "", message), close);
    region.append(box);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.remove(), 6500);
  }
  const themeTrigger = $(".theme-trigger"),
    popover = $(".theme-popover"),
    menu = $(".menu-toggle"),
    nav = $("#main-nav");
  function themeState() {
    $$(".theme-options button[data-theme]").forEach((b) => {
      const selected =
        b.dataset.theme ===
        (document.documentElement.dataset.theme || "default");
      b.classList.toggle("selected", selected);
      b.setAttribute("aria-pressed", String(selected));
      const check = $("app-icon", b);
      if (check) check.hidden = !selected;
    });
  }
  function closeTheme() {
    if (popover) popover.hidden = true;
    themeTrigger?.setAttribute("aria-expanded", "false");
  }
  themeTrigger?.addEventListener("click", () => {
    popover.hidden = !popover.hidden;
    themeTrigger.setAttribute("aria-expanded", String(!popover.hidden));
  });
  $$(".theme-options button").forEach(
    (b) =>
      (b.onclick = () => {
        document.documentElement.dataset.theme = b.dataset.theme;
        themeState();
        try {
          localStorage.setItem(
            "gautiyan-tola-theme",
            JSON.stringify(b.dataset.theme),
          );
        } catch {
          toast(
            "Browser storage is unavailable. Your theme will apply for this visit.",
          );
        }
      }),
  );
  themeState();
  function closeMenu() {
    if (menu) menu.replaceChildren(icon("menu"));
    nav?.classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
  }
  menu?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.replaceChildren(icon(open ? "close" : "menu"));
    menu.setAttribute("aria-expanded", String(open));
  });
  function activeNav() {
    $$("#main-nav > a").forEach((a) => {
      const u = new URL(a.href);
      a.classList.toggle(
        "active",
        u.hash
          ? location.pathname === u.pathname && location.hash === u.hash
          : u.pathname.endsWith("/")
            ? location.pathname === u.pathname && !location.hash
            : location.pathname.startsWith(u.pathname),
      );
    });
  }
  $$("#main-nav a").forEach((a) => a.addEventListener("click", closeMenu));
  activeNav();
  window.addEventListener("hashchange", activeNav);
  document.addEventListener("click", (e) => {
    if (!e.target.closest("app-theme-switcher")) closeTheme();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTheme();
      closeMenu();
    }
  });
  const top = $(".scroll-top");
  function scroll() {
    $(".navbar")?.classList.toggle("scrolled", scrollY > 20);
    if (top) top.hidden = scrollY <= 600;
  }
  window.addEventListener("scroll", scroll, { passive: true });
  scroll();
  top?.addEventListener("click", () =>
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    }),
  );
  $$("[data-whatsapp-unavailable]").forEach(
    (b) =>
      (b.onclick = () =>
        toast(
          "WhatsApp contact is not configured yet. The site owner needs to add their number before messages can be sent.",
        )),
  );
  if (
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    "IntersectionObserver" in window
  ) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.07 },
    );
    $$("[data-reveal]").forEach((n) => {
      n.classList.add("reveal-ready");
      observer.observe(n);
    });
  }
  function modal(title, content) {
    const previous = document.activeElement,
      overflow = document.body.style.overflow,
      dialog = el("dialog"),
      inner = el("div", "dialog-inner"),
      header = el("header", "dialog-header"),
      heading = el("h2", "", title),
      close = el("button", "icon-button");
    heading.id = "modal-title";
    dialog.setAttribute("aria-labelledby", "modal-title");
    close.type = "button";
    close.setAttribute("aria-label", "Close dialog");
    close.append(icon("close"));
    close.onclick = () => dialog.close();
    header.append(heading, close);
    inner.append(header, content);
    dialog.append(inner);
    document.body.append(dialog);
    document.body.style.overflow = "hidden";
    dialog.showModal();
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          dialog.close();
      }
    });
    dialog.addEventListener(
      "close",
      () => {
        $$("video", dialog).forEach((v) => {
          v.pause();
          v.removeAttribute("src");
          v.load();
        });
        dialog.remove();
        document.body.style.overflow = overflow;
        previous?.focus();
      },
      { once: true },
    );
    return { dialog, heading };
  }
  $$("[data-filter]").forEach(
    (button) =>
      (button.onclick = () => {
        const category = button.dataset.filter;
        $$("[data-filter]").forEach((b) => {
          b.classList.toggle("active", b === button);
          b.setAttribute("aria-pressed", String(b === button));
        });
        $$("[data-gallery]").forEach(
          (n) =>
            (n.hidden =
              category !== "All moments" && n.dataset.category !== category),
        );
      }),
  );
  $$("[data-gallery]").forEach(
    (tile) =>
      (tile.onclick = () => {
        const tiles = $$("[data-gallery]").filter((n) => !n.hidden);
        let index = tiles.indexOf(tile);
        const lightbox = el("div", "lightbox"),
          img = el("img"),
          controls = el("div", "lightbox-controls"),
          prev = el("button", "icon-button"),
          next = el("button", "icon-button"),
          caption = el("p");
        prev.setAttribute("aria-label", "Previous image");
        next.setAttribute("aria-label", "Next image");
        prev.append(icon("back"));
        next.append(icon("arrow"));
        controls.append(prev, caption, next);
        lightbox.append(img, controls);
        const m = modal("", lightbox);
        function show(delta = 0) {
          index = (index + delta + tiles.length) % tiles.length;
          const item = tiles[index],
            original = $("img", item);
          img.src = original.src;
          img.alt = original.alt;
          m.heading.textContent = item.dataset.title;
          caption.replaceChildren(
            document.createTextNode(item.dataset.credit),
            el("small", "", `${index + 1} / ${tiles.length}`),
          );
        }
        prev.onclick = () => show(-1);
        next.onclick = () => show(1);
        m.dialog.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            show(e.key === "ArrowLeft" ? -1 : 1);
          }
        });
        show();
      }),
  );
  $$("[data-video]").forEach(
    (button) =>
      (button.onclick = () => {
        const content = el("div"),
          player = el("div", "video-player"),
          video = el("video");
        video.src = button.dataset.video;
        video.poster = button.dataset.poster;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = "metadata";
        player.append(video);
        content.append(player);
        if (button.dataset.rotate === "true") {
          const rotate = el("button", "button button-outline", "Rotate view");
          rotate.prepend(icon("rotate"));
          rotate.onclick = () => player.classList.toggle("rotated");
          content.append(rotate);
        }
        if (button.dataset.description)
          content.append(el("p", "media-note", button.dataset.description));
        content.append(
          el(
            "p",
            "media-note",
            (button.dataset.credit || "") +
              " This original clip may include music.",
          ),
        );
        video.addEventListener(
          "error",
          () => {
            const p = el("p", "", "Your browser could not play this video. "),
              a = el("a", "", "Open the original file");
            p.setAttribute("role", "alert");
            a.href = button.dataset.video;
            a.target = "_blank";
            a.rel = "noopener";
            p.append(a);
            content.append(p);
          },
          { once: true },
        );
        modal(button.dataset.title, content);
      }),
  );
  const search = $("#story-search");
  function filterStories() {
    if (!search) return;
    const q = search.value.trim().toLowerCase();
    let count = 0;
    $$("app-blog-card").forEach((card) => {
      card.hidden = !card.dataset.search.toLowerCase().includes(q);
      if (!card.hidden) count++;
    });
    $("#story-count").textContent =
      `${count} ${count === 1 ? "story" : "stories"} to discover`;
    $("#search-empty").hidden = count !== 0;
  }
  search?.addEventListener("input", filterStories);
  filterStories();
  $("[data-share]")?.addEventListener("click", async (e) => {
    try {
      if (navigator.share)
        await navigator.share({
          title: e.currentTarget.dataset.share,
          url: location.href,
        });
      else {
        await navigator.clipboard.writeText(location.href);
        toast("Story link copied.");
      }
    } catch (error) {
      if (error.name !== "AbortError")
        toast(
          "Sharing is unavailable. Copy the page address from your browser.",
        );
    }
  });
  function fieldError(form, name, message) {
    const control = form.elements.namedItem(name),
      error = $(`[data-error="${name}"]`, form);
    if (control) control.setAttribute("aria-invalid", String(!!message));
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
  }
  function validateControl(control) {
    const value = control.value,
      label = control.dataset.label || "This field";
    if (control.required && !value.trim()) return `${label} is required.`;
    if (value && control.minLength > 0 && value.length < control.minLength)
      return `${label} needs at least ${control.minLength} characters.`;
    if (control.maxLength > 0 && value.length > control.maxLength)
      return `${label} is too long.`;
    if (
      control.pattern &&
      value &&
      !new RegExp("^(?:" + control.pattern + ")$").test(value)
    )
      return `${label} is not valid.`;
    return "";
  }
  async function post(form) {
    const header = $('meta[name="csrf-header"]').content,
      token = $('meta[name="csrf-token"]').content;
    const response = await fetch(form.action, {
      method: "POST",
      headers: { [header]: token, Accept: "application/json" },
      body: new FormData(form),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw Error(
        response.status === 403
          ? "Your session expired. Reload the page and try again."
          : "Could not complete your request. Please try again.",
      );
    }
    if (!response.ok) {
      for (const [name, message] of Object.entries(result.errors || {}))
        if (name) fieldError(form, name, message);
      throw Error(
        result.message || "Could not save your changes. Please try again.",
      );
    }
    return result;
  }
  function renderMessages(items) {
    const grid = $(".messages-grid");
    if (!grid) return;
    grid.replaceChildren();
    for (const m of items) {
      const wrapper = el("app-message-card"),
        card = el("article", "message-card"),
        quote = el("span", "quote-mark", "“"),
        author = el("div", "message-author"),
        text = el("div");
      quote.setAttribute("aria-hidden", "true");
      text.append(
        el("strong", "", m.authorOfMessage),
        el("small", "", localDate(m.createdAt)),
      );
      author.append(el("span", "avatar", m.authorOfMessage.charAt(0)), text);
      card.append(quote, el("blockquote", "", m.message), author);
      wrapper.append(card);
      grid.append(wrapper);
    }
  }
  function bindForm(form) {
    const fields = $$("input[data-label],textarea[data-label]", form);
    fields.forEach((c) => {
      c.addEventListener("blur", () => {
        c.dataset.touched = "true";
        fieldError(form, c.name, validateControl(c));
      });
      c.addEventListener("input", () => {
        if (c.dataset.touched) fieldError(form, c.name, validateControl(c));
        const counter = $(`[data-counter="${c.name}"]`, form);
        if (counter) counter.textContent = c.value.length;
      });
    });
    const file = $("input[type=file]", form),
      preview = $(".upload-preview", form);
    let photoError = "",
      previewUrl;
    file?.addEventListener("change", () => {
      photoError = "";
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      preview.hidden = true;
      const f = file.files[0];
      if (f) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 1500000
        ) {
          photoError = "Choose a JPG, PNG, or WebP image smaller than 1.5 MB.";
          file.value = "";
        } else {
          previewUrl = URL.createObjectURL(f);
          preview.src = previewUrl;
          preview.hidden = false;
        }
      }
      fieldError(form, "photo", photoError);
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const panel = form.parentElement.querySelector(".success-panel");
      if (panel) panel.hidden = true;
      let invalid = false;
      fields.forEach((c) => {
        c.dataset.touched = "true";
        const error = validateControl(c);
        fieldError(form, c.name, error);
        invalid ||= !!error;
      });
      if (invalid || photoError) {
        $('[aria-invalid="true"]', form)?.focus();
        return;
      }
      const button = $("[type=submit]", form);
      if (button.disabled) return;
      button.disabled = true;
      try {
        const result = await post(form);
        if (form.dataset.form === "admin") {
          await refreshAdmin(result.message);
          return;
        }
        form.reset();
        fields.forEach((c) => {
          delete c.dataset.touched;
          fieldError(form, c.name, "");
        });
        $$("[data-counter]", form).forEach((c) => (c.textContent = "0"));
        if (preview) {
          preview.hidden = true;
          preview.removeAttribute("src");
          if (previewUrl) URL.revokeObjectURL(previewUrl);
        }
        if (result.messages) renderMessages(result.messages);
        if (panel) {
          panel.hidden = false;
          $("[data-success-title]", panel).textContent = result.message;
          const submission = form.dataset.form === "submission";
          $("[data-success-description]", panel).textContent = result.url
            ? submission
              ? "Open WhatsApp below, attach your photograph if needed, and press Send. Publication follows the administrator’s review."
              : "One more step: open WhatsApp and press Send to share it with the administrator."
            : "WhatsApp is not configured yet. Your content is saved but has not been sent through WhatsApp.";
          const link = $("[data-success-link]", panel);
          link.hidden = !result.url;
          if (result.url) link.href = result.url;
        }
      } catch (error) {
        toast(error.message);
      } finally {
        button.disabled = false;
      }
    });
  }
  $$("form[data-form]").forEach(bindForm);
  let selectedTab = "blogs";
  function setTab(tab) {
    selectedTab = tab;
    $$("[data-tab]").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tab);
      b.setAttribute("aria-pressed", String(b.dataset.tab === tab));
    });
    $$("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== tab));
  }
  function values(item) {
    return Object.fromEntries(
      $$("[data-value]", item).map((n) => [n.dataset.value, n.value]),
    );
  }
  function edit(type, item) {
    const message = type === "message",
      form = $(
        `#${message ? "message" : "blog"}-editor`,
      ).content.firstElementChild.cloneNode(true),
      data = item ? values(item) : {};
    for (const [key, value] of Object.entries(data)) {
      const field = form.elements.namedItem(key);
      if (field) field.value = value;
    }
    if (!message) {
      form.elements.category.value = data.category || "Community";
      form.elements.sourceDraft.value = type === "draft" ? data.id : "";
      const generate = $("[data-generate]", form);
      generate.onclick = () => {
        form.elements.slug.value =
          form.elements.title.value
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "village-story";
      };
    }
    bindForm(form);
    modal(
      message
        ? "Edit community message"
        : item
          ? "Edit village story"
          : "Add a village story",
      form,
    );
  }
  async function refreshAdmin(message) {
    const response = await fetch(location.pathname, {
      headers: { Accept: "text/html" },
    });
    if (!response.ok)
      throw Error(
        "Saved, but the workspace could not refresh. Reload this page.",
      );
    const doc = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      ),
      next = $(".admin-page", doc);
    if (!next) throw Error("Saved. Reload to sign in again.");
    $("dialog")?.close();
    $(".admin-page").replaceWith(next);
    for (const id of ["blog-editor", "message-editor"])
      $("#" + id).replaceWith($("#" + id, doc));
    for (const name of ["csrf-token", "csrf-header"])
      $(`meta[name="${name}"]`).content = $(
        `meta[name="${name}"]`,
        doc,
      ).content;
    bindAdmin();
    setTab(selectedTab);
    toast(message);
  }
  function remove(type, item) {
    const data = values(item),
      content = el("div"),
      actions = el("div", "dialog-actions"),
      keep = el("button", "button button-outline", "Keep it"),
      confirm = el("button", "button button-danger", "Remove");
    content.append(
      el(
        "p",
        "",
        `“${data.title || data.name}” will be removed from the saved content. Export a backup first if you need to keep it.`,
      ),
    );
    actions.append(keep, confirm);
    content.append(actions);
    const m = modal("Remove this item?", content);
    keep.onclick = () => m.dialog.close();
    confirm.onclick = async () => {
      confirm.disabled = true;
      const form = el("form");
      form.action =
        location.pathname.replace(/\/$/, "") +
        "/" +
        type +
        "/" +
        encodeURIComponent(data.id) +
        "/delete";
      const input = el("input");
      input.name = "version";
      input.value = data.version;
      form.append(input);
      try {
        const result = await post(form);
        await refreshAdmin(result.message);
      } catch (error) {
        toast(error.message);
        confirm.disabled = false;
      }
    };
  }
  function bindAdmin() {
    localizeDates();
    $$("[data-export-url]").forEach(
      (b) =>
        (b.onclick = () => {
          location.href = b.dataset.exportUrl;
          toast("Content exported. Keep this file as your backup.");
        }),
    );
    $$("[data-tab]").forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
    $$("[data-add]").forEach((b) => (b.onclick = () => edit(b.dataset.add)));
    $$("[data-edit]").forEach(
      (b) => (b.onclick = () => edit(b.dataset.edit, b.closest("[data-item]"))),
    );
    $$("[data-delete]").forEach(
      (b) =>
        (b.onclick = () => remove(b.dataset.delete, b.closest("[data-item]"))),
    );
    setTab(selectedTab);
  }
  bindAdmin();
})();
