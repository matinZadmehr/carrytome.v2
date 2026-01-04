export function initTheme() {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch {
      // ignore
    }

    const applyTgColorScheme = () => {
      applyColorScheme(tg.colorScheme === "dark");
    };

    applyTgColorScheme();

    try {
      tg.onEvent("themeChanged", applyTgColorScheme);
    } catch {
      // ignore
    }
    return;
  }

  // Fallback to prefers-color-scheme
  const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (!mediaQuery) return;
  
  applyColorScheme(mediaQuery.matches);
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", (event) =>
      applyColorScheme(event.matches),
    );
  } else {
    // Safari < 14
    mediaQuery.addListener((event) => applyColorScheme(event.matches));
  }
}

export function applyColorScheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
}