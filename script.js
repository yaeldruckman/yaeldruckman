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
  },
  he: {
    dark: "כהה",
    light: "בהיר",
    sending: "שולח...",
    sent: "ההודעה נשלחה!",
  },
};

const t = i18n[lang] || i18n.en;

// ===== THEME COLORS =====
const themeColors = {
  dark: "#080d1a",
  light: "#faf8f5",
};

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

  if (themeMeta) themeMeta.setAttribute("content", themeColors[theme]);

  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    // localStorage unavailable
  }
}

// Initialize theme
const storedTheme =
  (function () {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  })() ||
  (window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark");

setTheme(storedTheme);

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    let current;
    try {
      current = localStorage.getItem("theme");
    } catch (err) {
      current = null;
    }
    if (!current) {
      setTheme(e.matches ? "dark" : "light");
    }
  });

toggle?.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  setTheme(next);
});

// ===== MOBILE NAV =====
if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));

    // Toggle hamburger icon to X
    if (isOpen) {
      navToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
    } else {
      navToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
    }
  });

  // Close mobile nav when clicking a link
  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
    });
  });

  // Close mobile nav on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav.classList.contains("open")) {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
      navToggle.focus();
    }
  });

  // Close mobile nav when clicking outside
  document.addEventListener("click", (e) => {
    if (
      mobileNav.classList.contains("open") &&
      !mobileNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
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
        behavior: "smooth",
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

  let lastScroll = 0;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header.style.borderBottomColor = "var(--border-light)";
    } else {
      header.style.borderBottomColor = "var(--border)";
    }

    lastScroll = scrollY;
    ticking = false;
  }

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
function initContactForm() {
  const form = document.querySelector(".contact-card");
  if (!form || form.tagName !== "FORM") return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const originalContent = button.innerHTML;

    // Show loading state
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      ${t.sending}
    `;
    button.disabled = true;

    // Simulate form submission (replace with actual form handler)
    setTimeout(() => {
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        ${t.sent}
      `;
      button.style.background = "#25d366";

      setTimeout(() => {
        button.innerHTML = originalContent;
        button.disabled = false;
        button.style.background = "";
        form.reset();
      }, 3000);
    }, 1500);
  });
}

// ===== FOOTER YEAR =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== INJECT KEYFRAMES FOR SPIN ANIMATION =====
const spinStyle = document.createElement("style");
spinStyle.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initActiveNavState();
  initMediaTabs();
  initSmoothScroll();
  initHeaderScroll();
  initContactForm();
});

// Re-run scroll animations if content was loaded dynamically
if (document.readyState === "complete") {
  initScrollAnimations();
  initActiveNavState();
  initMediaTabs();
  initSmoothScroll();
  initHeaderScroll();
  initContactForm();
}
