/* ==========================================================================
   MERIDIAN PAYROLL — JS FOUNDATION (Phase 1)
   Theme toggle | Mobile nav | Dropdown (desktop+mobile) | Active nav state
   Back-to-top | Scroll reveal | Header scroll state
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     0. PAGE LOADER
     ------------------------------------------------------------------ */
  function bindPageLoader() {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    const minDisplay = 450;
    const shownAt = performance.now();

    function hide() {
      const elapsed = performance.now() - shownAt;
      const wait = Math.max(0, minDisplay - elapsed);
      setTimeout(() => loader.classList.add("is-hidden"), wait);
    }

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide);
      // Safety net in case some asset never fires 'load'
      setTimeout(hide, 2500);
    }
  }

  /* ------------------------------------------------------------------
     1. THEME (Light/Dark) — persisted via localStorage
     ------------------------------------------------------------------ */
  const THEME_KEY = "meridian-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      const label = btn.querySelector(".theme-label");
      if (label) {
        label.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
      }
    });
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  function bindThemeToggle() {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme");
        applyTheme(current === "dark" ? "light" : "dark");
      });
    });
  }

  /* ------------------------------------------------------------------
     1b. DIRECTION (LTR / RTL) — persisted via localStorage
     ------------------------------------------------------------------ */
  const DIR_KEY = "meridian-dir";

  function applyDir(dir) {
    root.setAttribute("dir", dir);
    root.setAttribute("lang", dir === "rtl" ? "ar" : "en");
    localStorage.setItem(DIR_KEY, dir);
    document.querySelectorAll(".dir-toggle .dir-label").forEach((el) => {
      el.textContent = dir === "rtl" ? "LTR" : "RTL";
    });
    document.querySelectorAll(".dir-toggle").forEach((btn) => {
      btn.setAttribute("aria-label", dir === "rtl" ? "Switch to left-to-right" : "Switch to right-to-left");
    });
  }

  function initDir() {
    const saved = localStorage.getItem(DIR_KEY);
    applyDir(saved || "ltr");
  }

  function bindDirToggle() {
    document.querySelectorAll(".dir-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = root.getAttribute("dir") || "ltr";
        applyDir(current === "rtl" ? "ltr" : "rtl");
      });
    });
  }

  /* ------------------------------------------------------------------
     2. MOBILE NAVIGATION
     ------------------------------------------------------------------ */
  function bindMobileNav() {
    const hamburger = document.querySelector(".hamburger");
    const mobileNav = document.querySelector(".mobile-nav");
    if (!hamburger || !mobileNav) return;

    function closeMenu() {
      hamburger.classList.remove("is-active");
      mobileNav.classList.remove("is-open");
      mobileNav.style.removeProperty("top");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    function openMenu() {
      hamburger.classList.add("is-active");
      mobileNav.classList.add("is-open");
      hamburger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    hamburger.addEventListener("click", () => {
      const isOpen = mobileNav.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    const closeBtn = mobileNav.querySelector(".mobile-nav-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeMenu);
    }

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Close when a plain link (non-dropdown-toggle) is clicked
    mobileNav.querySelectorAll("a:not(.mobile-dropdown-toggle)").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ------------------------------------------------------------------
     3. DROPDOWN (Home 1 / Home 2 style submenus) — desktop click + mobile expand
     Works generically for any .nav-item.has-dropdown / .mobile-dropdown-toggle
     ------------------------------------------------------------------ */
  function bindDropdowns() {
    // Desktop: allow click-to-toggle in addition to hover (keyboard/touch friendly)
    document.querySelectorAll(".nav-item.has-dropdown > .nav-link").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        const parent = trigger.closest(".nav-item");
        const isTouchOrKeyboard = matchMedia("(hover: none)").matches;
        if (isTouchOrKeyboard) {
          e.preventDefault();
          document.querySelectorAll(".nav-item.has-dropdown").forEach((item) => {
            if (item !== parent) item.classList.remove("is-open");
          });
          parent.classList.toggle("is-open");
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-item.has-dropdown")) {
        document.querySelectorAll(".nav-item.has-dropdown").forEach((item) => item.classList.remove("is-open"));
      }
    });

    // Mobile: expand/collapse submenu
    document.querySelectorAll(".mobile-dropdown-toggle").forEach((toggle) => {
      const activate = (e) => {
        e.preventDefault();
        const submenu = toggle.nextElementSibling;
        const isOpen = toggle.classList.contains("is-open");

        toggle.classList.toggle("is-open");
        if (submenu) {
          submenu.style.maxHeight = isOpen ? "0px" : submenu.scrollHeight + "px";
        }
      };
      toggle.addEventListener("click", activate);
      toggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") activate(e);
      });
    });
  }

  /* ------------------------------------------------------------------
     4. ACTIVE NAV STATE (based on current file name)
     ------------------------------------------------------------------ */
  function setActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav-page]").forEach((link) => {
      if (link.getAttribute("data-nav-page") === path) {
        link.classList.add("is-active");
      }
    });
    // If the active page lives inside a dropdown (e.g. Home 2), also
    // highlight the parent trigger so "Home" reads as active.
    document.querySelectorAll(".nav-dropdown [data-nav-page].is-active").forEach((sub) => {
      const parentLink = sub.closest(".nav-item")?.querySelector(":scope > .nav-link");
      if (parentLink) parentLink.classList.add("is-active");
    });
    document.querySelectorAll(".mobile-submenu [data-nav-page].is-active").forEach((sub) => {
      const toggle = sub.closest(".mobile-submenu")?.previousElementSibling;
      if (toggle && toggle.classList.contains("mobile-dropdown-toggle")) toggle.classList.add("is-active");
    });
  }

  /* ------------------------------------------------------------------
     5. HEADER SCROLL STATE (subtle elevation on scroll)
     ------------------------------------------------------------------ */
  function bindHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      if (window.scrollY > 12) header.style.boxShadow = "var(--shadow-sm)";
      else header.style.boxShadow = "none";
    }
    document.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     6. BACK TO TOP
     ------------------------------------------------------------------ */
  function bindBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;
    function toggle() {
      if (window.scrollY > 500) btn.classList.add("is-visible");
      else btn.classList.remove("is-visible");
    }
    document.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    toggle();
  }

  /* ------------------------------------------------------------------
     7. SCROLL REVEAL (IntersectionObserver)
     ------------------------------------------------------------------ */
  function bindScrollReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     8. FAQ ACCORDION
     ------------------------------------------------------------------ */
  function bindFaq() {
    document.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const answer = item.querySelector(".faq-answer");
        const isOpen = item.classList.contains("is-open");

        // Close siblings within the same faq-list for a focused reading experience
        const list = item.closest(".faq-list");
        if (list) {
          list.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
            if (openItem !== item) {
              openItem.classList.remove("is-open");
              const openAnswer = openItem.querySelector(".faq-answer");
              if (openAnswer) openAnswer.style.maxHeight = "0px";
            }
          });
        }

        item.classList.toggle("is-open");
        answer.style.maxHeight = isOpen ? "0px" : answer.scrollHeight + "px";
      });
    });
  }

  /* ------------------------------------------------------------------
     9. TABS
     ------------------------------------------------------------------ */
  function bindTabs() {
    document.querySelectorAll(".tabs").forEach((tabGroup) => {
      const buttons = tabGroup.querySelectorAll(".tab-btn");
      const targetId = tabGroup.getAttribute("data-tabs-for");
      const panelContainer = targetId ? document.getElementById(targetId) : tabGroup.parentElement;

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-tab");
          buttons.forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          if (panelContainer) {
            panelContainer.querySelectorAll(".tab-panel").forEach((panel) => {
              panel.classList.toggle("is-active", panel.getAttribute("data-panel") === target);
            });
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     10. PRICING TOGGLE (Monthly / Annual)
     ------------------------------------------------------------------ */
  function bindPricingToggle() {
    const toggle = document.querySelector(".toggle-switch[data-pricing-toggle]");
    if (!toggle) return;
    const monthlyLabel = document.querySelector('[data-pricing-label="monthly"]');
    const annualLabel = document.querySelector('[data-pricing-label="annual"]');

    toggle.addEventListener("click", () => {
      const isOn = toggle.classList.toggle("is-on");
      document.querySelectorAll("[data-price-monthly]").forEach((el) => {
        const monthly = el.getAttribute("data-price-monthly");
        const annual = el.getAttribute("data-price-annual");
        el.textContent = isOn ? annual : monthly;
      });
      if (monthlyLabel) monthlyLabel.classList.toggle("is-active", !isOn);
      if (annualLabel) annualLabel.classList.toggle("is-active", isOn);
    });
  }

  /* ------------------------------------------------------------------
     11. ANIMATED COUNTERS (stat numbers count up when revealed)
     ------------------------------------------------------------------ */
  function bindCounters() {
    const counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.getAttribute("data-count-to"));
          const suffix = el.getAttribute("data-count-suffix") || "";
          const duration = 1400;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased * 10) / 10;
            el.textContent = (Number.isInteger(target) ? Math.round(value) : value) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     12. DASHBOARD SIDEBAR (mobile toggle)
     ------------------------------------------------------------------ */
  function bindDashSidebar() {
    const toggle = document.querySelector(".dash-menu-toggle");
    const sidebar = document.querySelector(".dash-sidebar");
    if (!sidebar) return;

    if (toggle) toggle.addEventListener("click", () => sidebar.classList.toggle("is-open"));

    document.addEventListener("click", (e) => {
      if (window.innerWidth > 1023) return;
      if (!sidebar.contains(e.target) && toggle && !toggle.contains(e.target)) {
        sidebar.classList.remove("is-open");
      }
    });

    bindDashboardViews(sidebar);
  }

  function bindDashboardViews(sidebar) {
    const main = document.querySelector(".dash-main");
    if (!main) return;

    const views = {
      overview: [".dash-topbar", ".dash-widget-grid"],
      payroll: ["#payroll"],
      tax: ["#tax"],
      employees: ["#employees"],
      reports: ["#reports"],
      billing: ["#billing"],
      settings: ["#billing"]
    };
    const contentSelectors = [".dash-topbar", ".dash-widget-grid", "#payroll", "#tax", "#employees", "#reports", "#billing"];
    const paymentMethods = document.querySelector("#billing > .dash-panel:first-child");
    const settings = document.querySelector("#settings");

    function showView(viewName, updateHash) {
      const activeView = views[viewName] ? viewName : "overview";
      contentSelectors.forEach((selector) => {
        const element = main.querySelector(selector);
        if (element) element.hidden = true;
      });

      views[activeView].forEach((selector) => {
        const element = main.querySelector(selector);
        if (element) element.hidden = false;
      });

      if (paymentMethods) paymentMethods.hidden = activeView === "settings";
      if (settings) settings.hidden = activeView !== "settings";

      sidebar.querySelectorAll(".dash-nav-link").forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeView}`);
      });
      main.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));

      if (updateHash) history.replaceState(null, "", `#${activeView}`);
    }

    sidebar.querySelectorAll(".dash-nav-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showView(link.getAttribute("href").slice(1), true);
        sidebar.classList.remove("is-open");
      });
    });

    window.addEventListener("hashchange", () => showView(window.location.hash.slice(1), false));
    showView(window.location.hash.slice(1), false);
  }

  /* ------------------------------------------------------------------
     15. INDUSTRY CHIP FILTER (Home 2 dynamic image & banner updates)
     ------------------------------------------------------------------ */
  function bindIndustryChips() {
    const chipRow = document.querySelector(".industry-chip-row");
    const bannerImg = document.getElementById("industry-banner-img");
    const bannerTitle = document.getElementById("industry-banner-title");
    const bannerDesc = document.getElementById("industry-banner-desc");
    if (!chipRow || !bannerImg) return;

    const chips = chipRow.querySelectorAll(".chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");

        const imgUrl = chip.getAttribute("data-img");
        const altText = chip.getAttribute("data-alt");
        const titleText = chip.getAttribute("data-title");
        const descText = chip.getAttribute("data-desc");

        bannerImg.style.opacity = "0.3";
        bannerImg.style.transform = "scale(0.98)";

        setTimeout(() => {
          if (imgUrl) bannerImg.src = imgUrl;
          if (altText) bannerImg.alt = altText;
          if (titleText && bannerTitle) bannerTitle.textContent = titleText;
          if (descText && bannerDesc) bannerDesc.textContent = descText;

          bannerImg.style.opacity = "1";
          bannerImg.style.transform = "scale(1)";
        }, 150);
      });
    });
  }

  /* ------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------ */
  // Register the loader hide-logic immediately — the #page-loader element
  // already exists in the DOM by the time this script tag runs (it's placed
  // right after <body>), so there's no need to wait for DOMContentLoaded.
  bindPageLoader();

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    bindThemeToggle();
    initDir();
    bindDirToggle();
    bindMobileNav();
    bindDropdowns();
    setActiveNav();
    bindHeaderScroll();
    bindBackToTop();
    bindScrollReveal();
    bindFaq();
    bindTabs();
    bindPricingToggle();
    bindCounters();
    bindDashSidebar();
    bindIndustryChips();
  });
})();
