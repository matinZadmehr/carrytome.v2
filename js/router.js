import { createRouteProgress } from './utils/dom.js';

const DEFAULT_ROUTE = "home";

export function initRouter(pageInitializers = {}) {
  const pages = Array.from(document.querySelectorAll("[data-page]"));
  if (pages.length === 0) return null;

  const tickProgress = createRouteProgress();
  let isFirstRender = true;
  let currentRoute = null;

  // Map routes to page elements
  const pageByRoute = new Map(
    pages
      .map((el) => [el.getAttribute("data-page"), el])
      .filter(([route]) => typeof route === "string" && route.length > 0),
  );

  const normalizeRoute = (route) => {
    if (typeof route !== "string") return DEFAULT_ROUTE;
    const cleaned = route.trim().replace(/^\/+/, "");
    if (!cleaned) return DEFAULT_ROUTE;
    return pageByRoute.has(cleaned) ? cleaned : DEFAULT_ROUTE;
  };

  const routeFromHash = () => {
    const hash = window.location.hash || "";
    const withoutHash = hash.replace(/^#\/?/, "");
    if (!withoutHash) return DEFAULT_ROUTE;
    const routePart = withoutHash.split(/[?&]/, 1)[0];
    return normalizeRoute(decodeURIComponent(routePart));
  };

  const updateNavVisibility = (route) => {
    const nav = document.querySelector("nav[data-visible-pages]");
    if (!nav) return;

    const visiblePagesAttr = nav.getAttribute("data-visible-pages");
    if (!visiblePagesAttr) return;

    const visiblePages = visiblePagesAttr.split(",").map((p) => p.trim());
    const isPageVisible = visiblePages.includes(route);

    if (isPageVisible) {
      nav.classList.remove("hidden");
      nav.style.display = "";
    } else {
      nav.classList.add("hidden");
      nav.style.display = "none";
    }
  };

  const showRoute = (route) => {
    const activeRoute = normalizeRoute(route);
    const routeChanged = activeRoute !== currentRoute;
    currentRoute = activeRoute;

    if (routeChanged && !isFirstRender) tickProgress();

    // Hide all pages, show active page
    for (const [pageRoute, pageEl] of pageByRoute) {
      const isActive = pageRoute === activeRoute;

      if (!isActive) {
        pageEl.classList.add("hidden");
        pageEl.setAttribute("aria-hidden", "true");
        pageEl.classList.remove("page-enter");
        continue;
      }

      const wasHidden = pageEl.classList.contains("hidden");
      pageEl.classList.remove("hidden");
      pageEl.removeAttribute("aria-hidden");

      if (routeChanged && !isFirstRender && wasHidden) {
        pageEl.classList.add("page-enter");
        window.requestAnimationFrame(() => {
          pageEl.classList.remove("page-enter");
        });
      }

      // Initialize page-specific functionality
      if (routeChanged && pageInitializers[pageRoute]) {
        try {
          pageInitializers[pageRoute]();
        } catch (error) {
          console.error(`Error initializing page ${pageRoute}:`, error);
        }
      }
    }

    updateNavVisibility(activeRoute);

    if (routeChanged) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    
    isFirstRender = false;
  };

  const navigate = (route, { replace = false } = {}) => {
    const targetRoute = normalizeRoute(route);
    const nextHash = `#/${encodeURIComponent(targetRoute)}`;
    if (replace) {
      window.location.replace(nextHash);
    } else {
      window.location.hash = nextHash;
    }
    showRoute(targetRoute);
  };

  // Initialize event listeners
  window.addEventListener("hashchange", () => showRoute(routeFromHash()));
  
  // Initial route
  showRoute(routeFromHash());

  return { navigate, normalizeRoute, routeFromHash };
}

export function initNavigation(router) {
  const navigate = (route, opts) => {
    if (router) router.navigate(route, opts);
    else window.location.assign(route);
  };

  const handleNav = (event, el) => {
    const explicitRoute = el.getAttribute("data-route");
    const href = el.getAttribute("data-href");
    const targetRoute = explicitRoute || routeFromHref(href);

    if (targetRoute) {
      event.preventDefault();
      navigate(targetRoute);
      return;
    }

    if (href) {
      event.preventDefault();
      window.location.assign(href);
    }
  };

  document.addEventListener("click", (event) => {
    const el = event.target?.closest?.("[data-route], [data-href]");
    if (!el) return;
    handleNav(event, el);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    if (!el.matches("[role='button'][data-route], [role='button'][data-href]")) return;
    handleNav(event, el);
  });
}

function routeFromHref(href) {
  if (typeof href !== "string" || href.length === 0) return null;
  if (href.startsWith("#")) {
    const route = href.replace(/^#\/?/, "");
    return route.length > 0 ? decodeURIComponent(route) : DEFAULT_ROUTE;
  }
  return null;
}