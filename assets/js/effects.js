/**
 * Scroll-driven effects: section reveals, word-by-word paragraph lighting,
 * the horizontal statement band, the feature marquee and the active section nav.
 */
import { log } from "./logger.js";

const MARQUEE_ITEMS = [
  { label: "iCloud Reminders", icon: '<path d="M17.5 19a4.5 4.5 0 0 0 0-9h-1.3A7 7 0 1 0 5 16.3"/><path d="M9 19h8.5"/>' },
  { label: "Google Calendar", icon: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>' },
  { label: "Google Tasks", icon: '<path d="m4 12 5 5L20 6"/>' },
  { label: "Today view", icon: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>' },
  { label: "Per-task focus timer", icon: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>' },
  { label: "Pause & reset", icon: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>' },
  { label: "Silence chosen apps", icon: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="m3 3 18 18"/>' },
  { label: "Desktop widget", icon: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>' },
  { label: "Direct download", icon: '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>' },
];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// ---------- Reveal on scroll ----------

const initReveal = () => {
  const targets = document.querySelectorAll("[data-reveal]");
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );
  targets.forEach((target) => observer.observe(target));
};

// ---------- Word-by-word paragraph lighting ----------

const splitIntoWords = (element) => {
  const words = element.textContent.trim().split(/\s+/);
  const spans = words.map((word) => {
    const span = document.createElement("span");
    span.className = "reveal-word";
    span.textContent = word;
    return span;
  });
  // Spaces stay as text nodes so the paragraph still reads naturally to screen readers.
  element.replaceChildren(...spans.flatMap((span, index) => (index ? [document.createTextNode(" "), span] : [span])));
  return spans;
};

const createRevealTextUpdater = () => {
  const paragraphs = [...document.querySelectorAll("[data-reveal-text]")].map((element) => ({
    element,
    words: splitIntoWords(element),
  }));

  if (prefersReducedMotion()) {
    paragraphs.forEach(({ words }) => words.forEach((word) => word.classList.add("is-lit")));
    return () => {};
  }

  return () => {
    const viewportHeight = window.innerHeight;
    paragraphs.forEach(({ element, words }) => {
      const rect = element.getBoundingClientRect();
      // Lighting starts when the paragraph enters the lower 85% of the screen and ends near the middle.
      const start = viewportHeight * 0.85;
      const end = viewportHeight * 0.4;
      const progress = clamp((start - rect.top) / (start - end + rect.height * 0.5), 0, 1);
      const litCount = Math.round(progress * words.length);
      words.forEach((word, index) => word.classList.toggle("is-lit", index < litCount));
    });
  };
};

// ---------- Horizontal statement band ----------

const createStatementUpdater = () => {
  const section = document.querySelector("[data-statement]");
  const track = document.querySelector("[data-statement-track]");
  if (!section || !track || prefersReducedMotion()) return () => {};

  return () => {
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    const progress = clamp(-rect.top / scrollable, 0, 1);
    // Ends with the last word resting near the right edge rather than scrolling fully out.
    const distance = track.scrollWidth - window.innerWidth * 0.95;
    track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
  };
};

// ---------- Marquee ----------

const createMarqueeItem = ({ label, icon }) => {
  const item = document.createElement("li");
  item.className = "marquee__item";
  item.innerHTML = `<svg class="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>`;
  item.append(label);
  return item;
};

const initMarquee = () => {
  const tracks = document.querySelectorAll("[data-marquee-items]");
  const half = Math.ceil(MARQUEE_ITEMS.length / 2);

  tracks.forEach((track) => {
    const isPrimary = track.dataset.marqueeItems === "primary";
    // Each row starts at a different item so the two rows don't mirror each other.
    const ordered = isPrimary ? MARQUEE_ITEMS : [...MARQUEE_ITEMS.slice(half), ...MARQUEE_ITEMS.slice(0, half)];
    const items = ordered.map(createMarqueeItem);

    if (!prefersReducedMotion()) {
      // A hidden second copy makes the CSS loop seamless.
      const copies = ordered.map(createMarqueeItem);
      copies.forEach((copy) => copy.setAttribute("aria-hidden", "true"));
      items.push(...copies);
    }
    track.replaceChildren(...items);
  });
};

// ---------- Active section in the bottom nav ----------

const initSectionNav = () => {
  const links = new Map(
    [...document.querySelectorAll("[data-section-link]")].map((link) => [link.dataset.sectionLink, link]),
  );
  const sections = document.querySelectorAll("[data-section]");
  if (!links.size || !("IntersectionObserver" in window)) return;

  const setActive = (sectionName) => {
    links.forEach((link, name) => {
      if (name === sectionName) {
        link.setAttribute("aria-current", "true");
        // Keeps the active pill visible when the bar scrolls horizontally on small screens.
        const list = link.closest("ul");
        list?.scrollTo({ left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  // A thin band across the middle of the viewport decides which section is current.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.dataset.section);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
};

// ---------- Init ----------

export const initEffects = () => {
  initReveal();
  initMarquee();
  initSectionNav();

  const updaters = [createRevealTextUpdater(), createStatementUpdater()];
  let frameRequested = false;

  // Scroll work is batched into one animation frame to keep scrolling smooth.
  const onScroll = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(() => {
      updaters.forEach((update) => update());
      frameRequested = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  log("Scroll effects ready");
};
