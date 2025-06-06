// src/components/Layout.jsx
import React, { useEffect, useState } from "react";

export default function Layout({ children }) {
  // 1) Initialize theme from localStorage (if present), else from system preference.
  //    We do this inside useState(() => { … }) so it only runs once.
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      // In case of SSR (unlikely here), default to light
      return "light";
    }
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      // If no stored value, fallback to system preference:
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
        .matches;
      return prefersDark ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  // 2) Whenever `theme` changes, update <html> class and persist the new choice
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore if localStorage is unavailable
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Feature Flag Management App</h1>
        <button
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded transition-colors"
        >
          {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
        </button>
      </header>

      <main className="flex-1 p-6">{children}</main>

      <footer className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        © 2024 Your Name
      </footer>
    </div>
  );
}
