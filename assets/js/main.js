/* =========================================================
   truhydrate — landing page interactions
   ========================================================= */

/* ---------------------------------------------------------
   SHOPIFY LINKS
   Set `store` to the live store domain and fill in each product
   handle. Until `store` is set, all shop buttons scroll to #shop.
   --------------------------------------------------------- */
const SHOPIFY = {
  store: "", // e.g. "https://truhydrate.com" or "https://truhydrate.myshopify.com"
  links: {
    collection: "/collections/all",
    noir: "/products/truhydrate-noir",
    ice: "/products/truhydrate-ice",
    pure: "/products/truhydrate-pure",
  },
};

(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Shopify hrefs ---------- */
  if (SHOPIFY.store) {
    const base = SHOPIFY.store.replace(/\/$/, "");
    document.querySelectorAll("[data-shop]").forEach((a) => {
      const path = SHOPIFY.links[a.dataset.shop];
      if (path) a.href = base + path;
    });
  }

  /* ---------- Year ---------- */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-menu-toggle]");
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    // tuck the pill away while scrolling down, bring it back on scroll up
    if (!nav.classList.contains("is-open") && Math.abs(y - lastY) > 6) {
      nav.classList.toggle("is-hidden", y > lastY && y > 400);
      lastY = y;
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // highlight the link of the section in view
  const navLinks = [...nav.querySelectorAll(".nav__links a")];
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["top", "origin", "wearable", "design", "shop"].forEach((id) => {
      const el = document.getElementById(id); if (el) spy.observe(el);
    });
  }

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".nav__links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal], [data-callout]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- GSAP-driven motion ---------- */
  const hasGsap = window.gsap && window.ScrollTrigger;
  if (!hasGsap || reduceMotion) {
    root.classList.add("no-motion");
    document.querySelectorAll("[data-step]").forEach((li) => li.classList.add("is-active"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero intro
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from("[data-hero-line]", { yPercent: 110, duration: 1.4, stagger: 0.12 })
    .from("[data-hero-in]", { y: 24, opacity: 0, duration: 1.2, stagger: 0.08 }, "-=1.1")
    .from(".hero__visual", { scale: 1.08, opacity: 0, duration: 2 }, 0);

  // Hero image drifts on scroll
  gsap.to("[data-parallax]", {
    yPercent: 18, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // Statement: the two lines slide in from opposite sides
  ["solid", "outline"].forEach((kind) => {
    const box = `.statement__type--${kind}`;
    gsap.fromTo(`${box} [data-type-l]`, { xPercent: -18 }, {
      xPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".statement", start: "top bottom", end: "center center", scrub: true },
    });
    gsap.fromTo(`${box} [data-type-r]`, { xPercent: 18 }, {
      xPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".statement", start: "top bottom", end: "center center", scrub: true },
    });
  });

  // mobile browsers resize the viewport as the URL bar shows/hides; don't recalc on that
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Wearable: draw the strap out of the label
  const steps = gsap.utils.toArray("[data-step]");
  const setStep = (i) => steps.forEach((li, n) => li.classList.toggle("is-active", n === i));
  const strapTimeline = (tl) => tl
    .to("[data-peel]", { attr: { height: 0 }, duration: 1.6 }, 0.6)
    .to("[data-strap]", { strokeDashoffset: 0, duration: 1.6 }, 0.6)
    .to("[data-buckle]", { opacity: 1, duration: 0.3 }, 2.1)
    .to(".wearable__scene svg", { rotate: -8, duration: 0.8 }, 2.2);

  const mm = gsap.matchMedia();
  // desktop: pin the section and step through the story
  mm.add("(min-width: 821px)", () => {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".wearable",
        pin: ".wearable__pin",
        start: "top top",
        end: "+=180%",
        scrub: 0.6,
        onUpdate: (st) => setStep(Math.min(2, Math.floor(st.progress * 3))),
      },
    });
    tl.to("[data-progress]", { scaleX: 1, duration: 3 }, 0);
    strapTimeline(tl);
  });
  // mobile: no pinning, the strap draws as the bottle scrolls through view
  mm.add("(max-width: 820px)", () => {
    steps.forEach((li) => li.classList.add("is-active"));
    strapTimeline(gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".wearable__scene", start: "top 75%", end: "bottom 35%", scrub: 0.6 },
    }));
  });

  // Anatomy bottle floats up as it enters
  gsap.from(".anatomy__bottle svg", {
    y: 80, ease: "none",
    scrollTrigger: { trigger: ".anatomy", start: "top bottom", end: "center center", scrub: true },
  });
})();
