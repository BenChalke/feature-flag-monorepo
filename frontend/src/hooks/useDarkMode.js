import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "theme";

export default function useDarkMode() {
  // 1. Read initial theme: localStorage → system preference → default “light”
  const getInitialTheme = () => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    // fallback to system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // 2. Whenever theme changes, apply it to <html> and save in localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // 3. Listen for system‐level “prefers‐color‐scheme” changes and update if user hasn’t manually overridden
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      // only update if there’s no manual override
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== "light" && stored !== "dark") {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // 4. Expose a toggler function
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return [theme, toggleTheme];
}
