// ===== DOM REFS =====
const root = document.documentElement;
const body = document.body;
const lang = root.getAttribute("lang") || "en";
const toggle = document.getElementById("themeToggle");
const iconMoon = toggle?.querySelector(".icon-moon");
const iconSun = toggle?.querySelector(".icon-sun");
const label = toggle?.querySelector(".toggle-label");
const themeMeta = document.getElementById("theme-color");
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

// ===== LOCALIZATION =====
const i18n = {
  en: {
    dark: "Dark",
    light: "Light",
    sending: "Sending...",
    sent: "Message Sent!",
    sendError: "Send failed. Try again.",
  },
  he: {
    dark: "כהה",
    light: "בהיר",
    sending: "בשליחה...",
    sent: "ההודעה נשלחה!",
    sendError: "השליחה נכשלה. נסו שוב.",
  },
};

const t = i18n[lang] || i18n.en;

function syncThemeColor() {
  if (!themeMeta) return;
  const bg = getComputedStyle(root).getPropertyValue("--bg-main").trim();
  if (bg) themeMeta.setAttribute("content", bg);
}

// ===== THEME TOGGLE =====
function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  toggle?.setAttribute("aria-pressed", String(theme === "dark"));

  if (label) label.textContent = theme === "dark" ? t.dark : t.light;

  if (iconMoon && iconSun) {
    iconMoon.style.display = theme === "dark" ? "block" : "none";
    iconSun.style.display = theme === "light" ? "block" : "none";
  }

  syncThemeColor();

  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    // localStorage unavailable
  }
}

// Initialize theme (dark theme only)
setTheme("dark");

// ===== MOBILE NAV =====
if (navToggle && mobileNav) {
  const hamburger = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
  const close = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

  const openLabel = navToggle.getAttribute("aria-label");
  const closeLabel = navToggle.dataset.closeLabel || openLabel;

  const setNavState = (open) => {
    mobileNav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? closeLabel : openLabel);
    navToggle.innerHTML = open ? close : hamburger;
  };

  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setNavState(!mobileNav.classList.contains("open"));
  });

  mobileNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setNavState(false);
  });

  document.addEventListener("click", (e) => {
    if (
      mobileNav.classList.contains("open") &&
      !mobileNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      setNavState(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav.classList.contains("open")) {
      setNavState(false);
      navToggle.focus();
    }
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    // If user prefers reduced motion, make everything visible immediately
    document.querySelectorAll(".fade-up").forEach((el) => {
      el.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  document.querySelectorAll(".fade-up").forEach((el) => {
    observer.observe(el);
  });
}

// ===== ACTIVE NAV STATE ON SCROLL =====
function initActiveNavState() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    threshold: 0,
    rootMargin: "-25% 0px -65% 0px",
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

// ===== MEDIA TABS =====
function initMediaTabs() {
  const tabs = document.querySelectorAll(".media-tab");
  const contents = document.querySelectorAll(".tab-content");

  if (!tabs.length || !contents.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update active content
      contents.forEach((c) => c.classList.remove("active"));
      const targetContent = document.getElementById(`tab-${targetId}`);
      if (targetContent) {
        targetContent.classList.add("active");

        // Re-trigger fade-up animations for newly visible content
        targetContent.querySelectorAll(".fade-up").forEach((el) => {
          el.classList.remove("visible");
          // Force reflow
          void el.offsetWidth;
          el.classList.add("visible");
        });
      }
    });
  });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const headerHeight = document.querySelector("header")?.offsetHeight || 70;
      const targetPosition =
        targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "auto"
                  : "smooth",
      });

      // Update URL without triggering scroll
      history.pushState(null, "", targetId);
    });
  });
}

// ===== HEADER SCROLL EFFECT =====
function initHeaderScroll() {
  const header = document.querySelector("header");
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;
    header.classList.toggle("scrolled", scrollY > 0);
    ticking = false;
  }

  updateHeader();

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true },
  );
}

// ===== FORM HANDLING =====
// Deploy Apps Script as web app (Anyone) and paste the /exec URL here.
const scriptURL = "https://script.google.com/macros/s/AKfycbwj3FYzJraC9rN9r-SI84CLkE-7s71GRA_n4gzhQMlT_gvUojjFem3jK0reMfhO3Be2/exec";
const TURNSTILE_SITEKEY = "0x4AAAAAAEqThupzZW7KG05P";
const TURNSTILE_ACTION = "contact";

let turnstileWidgetId = null;
let contactFormBound = false;

window.onTurnstileLoad = function () {
  const container = document.getElementById("cf-turnstile");
  if (!container || !window.turnstile || turnstileWidgetId !== null) return;
  turnstileWidgetId = window.turnstile.render(container, {
    sitekey: TURNSTILE_SITEKEY,
    action: TURNSTILE_ACTION,
    theme: "dark",
    language: lang === "he" ? "he" : "auto",
    size: "flexible",
    appearance: "interaction-only",
  });
};

// Load Turnstile only when the form approaches the viewport (or gets focus),
// so visitors who never reach the form don't contact Cloudflare.
const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";

function loadTurnstile() {
  if (window.turnstile) return window.onTurnstileLoad();
  if (document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/"]')) return;
  const s = document.createElement("script");
  s.src = TURNSTILE_SRC;
  s.async = true;
  document.head.appendChild(s);
}

function initLazyTurnstile(form) {
  form.addEventListener("focusin", loadTurnstile, { once: true });
  if (!("IntersectionObserver" in window)) return loadTurnstile();
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        loadTurnstile();
      }
    },
    { rootMargin: "600px 0px" },
  );
  io.observe(form);
}

function resetTurnstile() {
  if (window.turnstile && turnstileWidgetId !== null) {
    window.turnstile.reset(turnstileWidgetId);
  }
}

function getTurnstileToken() {
  if (!window.turnstile || turnstileWidgetId === null) return "";
  return window.turnstile.getResponse(turnstileWidgetId) || "";
}

function initContactForm() {
  const form = document.querySelector("form.contact-card");
  const button = form?.querySelector('button[type="submit"]');
  if (!form || !button || contactFormBound) return;
  contactFormBound = true;
  initLazyTurnstile(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (button.disabled) return;
    const originalContent = button.innerHTML;

    // Outline buttons take their color from --btn-tone; filled buttons use background.
    const isOutline = /\bbtn-outline-/.test(button.className);
    const setButton = (html, { disabled = true, background = "" } = {}) => {
      button.innerHTML = html;
      button.disabled = disabled;
      if (isOutline) button.style.setProperty("--btn-tone", background);
      else button.style.background = background;
    };

    const token = getTurnstileToken();
    if (!token || token.length > 2048) {
      setButton(`<span>${t.sendError}</span>`, {
        background: "oklch(54.33% 0.174 29.7)",
      });
      resetTurnstile();
      setTimeout(() => {
        setButton(originalContent, { disabled: false });
      }, 3000);
      return;
    }

    setButton(
      `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      ${t.sending}
    `,
    );

    try {
      const res = await fetch(scriptURL, {
        method: "POST",
        body: new FormData(form),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.success) throw new Error("submit failed");

      setButton(
        `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        ${t.sent}
      `,
        { background: "oklch(76.10% 0.201 149.7)" },
      );
      form.reset();

      setTimeout(() => {
        setButton(originalContent, { disabled: false });
      }, 3000);
    } catch (err) {
      console.error("Form submit failed:", err);
      setButton(`<span>${t.sendError}</span>`, {
        background: "oklch(54.33% 0.174 29.7)",
      });
      setTimeout(() => {
        setButton(originalContent, { disabled: false });
      }, 3000);
    } finally {
      resetTurnstile();
    }
  });
}

// ===== FOOTER YEAR =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== INJECT KEYFRAMES FOR SPIN ANIMATION =====
const spinStyle = document.createElement("style");
spinStyle.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

// ===== SHARED TESTIMONIAL AND VIDEO DIALOGS =====
function initDialogs() {
  const dialog = document.getElementById("morph-dialog");
  const modalCard = document.getElementById("modal-card");
  const modalContent = document.getElementById("modal-content-inner");
  const closeBtn = document.getElementById("modal-close");
  const videoDialog = document.getElementById("video-dialog");
  const videoCloseBtn = document.getElementById("video-modal-close");
  const videoIframe = document.getElementById("video-iframe");
  if (dialog && !dialog.hasAttribute("aria-label") && !dialog.hasAttribute("aria-labelledby")) {
    dialog.setAttribute("aria-label", lang === "he" ? "המלצה" : "Testimonial");
  }
  if (videoDialog && !videoDialog.hasAttribute("aria-label") && !videoDialog.hasAttribute("aria-labelledby")) {
    videoDialog.setAttribute("aria-label", lang === "he" ? "סרטון" : "Video");
  }
  let activeDialog = null;
  let activeCard = null;
  let returnFocus = null;
  let scrollStyles = null;
  let transition = null;
  let closeRequested = false;
  const transitionStyles = new Map();

  function nameTransition(element, name) {
    if (!element) return;
    if (!transitionStyles.has(element)) {
      transitionStyles.set(element, element.style.viewTransitionName);
    }
    element.style.viewTransitionName = name;
  }

  function resetTransitionNames() {
    transitionStyles.forEach((name, element) => {
      element.style.viewTransitionName = name;
    });
    transitionStyles.clear();
  }

  function lockScroll() {
    scrollStyles = {
      overflow: body.style.overflow,
      paddingInlineEnd: body.style.paddingInlineEnd,
    };
    const compensation = window.innerWidth - root.clientWidth;
    if (compensation > 0) {
      const padding = parseFloat(getComputedStyle(body).paddingInlineEnd) || 0;
      body.style.paddingInlineEnd = `${padding + compensation}px`;
    }
    body.style.overflow = "hidden";
  }

  function showDialog(target, trigger, closeButton) {
    returnFocus = trigger || document.activeElement;
    try {
      target.showModal();
    } catch (error) {
      returnFocus = null;
      return false;
    }
    activeDialog = target;
    lockScroll();
    closeButton.focus({ preventScroll: true });
    return true;
  }

  function cleanupDialog(target) {
    if (activeDialog !== target) return;
    activeCard?.classList.remove("is-ghost");
    activeCard = null;
    if (target === videoDialog) videoIframe?.removeAttribute("src");
    if (scrollStyles) {
      body.style.overflow = scrollStyles.overflow;
      body.style.paddingInlineEnd = scrollStyles.paddingInlineEnd;
      scrollStyles = null;
    }
    activeDialog = null;
    const trigger = returnFocus;
    returnFocus = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }

  function runMorph(update) {
    if (
      typeof document.startViewTransition !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      update();
      resetTransitionNames();
      return;
    }
    let updated = false;
    const apply = () => {
      if (updated) return;
      updated = true;
      update();
    };
    const finish = () => {
      transition = null;
      resetTransitionNames();
      if (closeRequested) {
        closeRequested = false;
        closeMorphDialog();
      }
    };
    try {
      transition = document.startViewTransition(apply);
      // A skipped animation can reject ready even though its DOM update succeeds.
      transition.ready.catch(() => {});
      transition.finished.then(finish, () => {
        apply();
        finish();
      });
    } catch (error) {
      apply();
      finish();
    }
  }

  function expandTestimonial(btn, card) {
    if (!btn.dataset.collapsedLabel) btn.dataset.collapsedLabel = btn.textContent;
    const expanded = card.classList.toggle("expanded");
    btn.setAttribute("aria-expanded", String(expanded));
    btn.textContent = expanded
      ? lang === "he" ? "לקריאה מקוצרת" : "Read Less"
      : btn.dataset.collapsedLabel;
  }

  window.morphTestimonial = function (btn) {
    const card = btn?.closest(".testimonial-card");
    if (!card || activeDialog || transition) return;
    if (!dialog || !modalCard || !modalContent || !closeBtn ||
        typeof dialog.showModal !== "function") {
      expandTestimonial(btn, card);
      return;
    }
    activeCard = card;
    const author = card.querySelector(".testimonial-author");
    nameTransition(card, "morph-card");
    nameTransition(author, "morph-author");
    runMorph(() => {
      nameTransition(card, "none");
      nameTransition(author, "none");
      modalContent.innerHTML = card.innerHTML;
      // Cloned controls must not duplicate document IDs or remain focusable.
      modalContent.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      modalContent.querySelectorAll(".read-more-btn").forEach((el) => el.remove());
      nameTransition(modalCard, "morph-card");
      nameTransition(modalContent.querySelector(".testimonial-author"), "morph-author");
      if (showDialog(dialog, btn, closeBtn)) {
        card.classList.add("is-ghost");
        dialog.querySelector(".scroll-area")?.scrollTo(0, 0);
      } else {
        activeCard = null;
        expandTestimonial(btn, card);
      }
    });
  };
  // Legacy markup and new markup use the same handler, never two click listeners.
  window.toggleTestimonial = window.morphTestimonial;

  function closeMorphDialog() {
    if (transition) {
      closeRequested = true;
      transition.skipTransition();
      return;
    }
    if (activeDialog !== dialog || !dialog?.open) return;
    nameTransition(modalCard, "morph-card");
    const modalAuthor = modalContent.querySelector(".testimonial-author");
    nameTransition(modalAuthor, "morph-author");
    runMorph(() => {
      nameTransition(modalCard, "none");
      nameTransition(modalAuthor, "none");
      nameTransition(activeCard, "morph-card");
      nameTransition(activeCard?.querySelector(".testimonial-author"), "morph-author");
      dialog.close();
      cleanupDialog(dialog);
    });
  }

  window.openVideoModal = function (event, url) {
    if (!videoDialog || !videoCloseBtn || !videoIframe || activeDialog || transition ||
        typeof videoDialog.showModal !== "function") return;
    let id;
    try {
      const parsed = new URL(url, document.baseURI);
      if (!["www.youtube.com", "youtube.com", "m.youtube.com"].includes(parsed.hostname)) return;
      id = parsed.searchParams.get("v");
    } catch (error) {
      return;
    }
    if (!id || !/^[\w-]{11}$/.test(id)) return;
    if (!showDialog(videoDialog, event?.currentTarget, videoCloseBtn)) return;
    event?.preventDefault();
    videoIframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`;
  };

  function closeVideoDialog() {
    if (activeDialog !== videoDialog || !videoDialog?.open) return;
    videoDialog.close();
    cleanupDialog(videoDialog);
  }

  function bindDialog(target, button, close) {
    if (!target || !button) return;
    button.addEventListener("click", close);
    target.addEventListener("click", (event) => {
      if (event.target !== target) return;
      const bounds = target.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    });
    target.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    target.addEventListener("close", () => cleanupDialog(target));
  }

  bindDialog(dialog, closeBtn, closeMorphDialog);
  bindDialog(videoDialog, videoCloseBtn, closeVideoDialog);
}

// Hide floating WhatsApp while either home page's hero is in view.
function initWhatsappHeroHide() {
  const fab = document.querySelector(".whatsapp-float");
  const hero = document.getElementById("home");
  if (!fab || !hero || fab.dataset.heroHideInit === "1") return;
  fab.dataset.heroHideInit = "1";

  const header = document.querySelector("header");

  // Show as soon as the hero's bottom edge passes under the sticky header
  // (the header covers the last strip of the hero, so the viewport top is too late).
  let ticking = false;
  const update = () => {
    ticking = false;
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    fab.classList.toggle(
      "is-hidden-over-hero",
      hero.getBoundingClientRect().bottom > headerBottom,
    );
  };
  const schedule = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
}

// ===== INIT =====
function initPage() {
  initScrollAnimations();
  initActiveNavState();
  initMediaTabs();
  initSmoothScroll();
  initHeaderScroll();
  initContactForm();
  initWhatsappHeroHide();
  initDialogs();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage, { once: true });
} else {
  initPage();
}
