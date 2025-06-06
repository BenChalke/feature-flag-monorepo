// src/components/ThemeToggle.jsx
import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";

export default function ThemeToggle() {
  // 1) Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  // 2) On theme change: toggle the "dark" class on <html> and persist
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
      /* ignore */
    }
  }, [theme]);

  return (
    <Switch
      checked={theme === "dark"}
      onChange={() => setTheme(prev => (prev === "dark" ? "light" : "dark"))}
      className={`
        relative 
        inline-flex 
        items-center 
        h-8 w-20               /* track: 32px tall, 80px wide */
        cursor-pointer 
        rounded-full 
        border-2 
        ${theme === "dark" ? "border-gray-600" : "border-gray-300"} 
        transition-colors 
        focus:outline-none
      `}
    >
      {/* ─── BACKGROUND SVG ───────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {theme === "dark" ? (
          // Dark mode: night sky + stars
          <svg
            viewBox="0 0 240 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="nightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0d1f2d" />
                <stop offset="100%" stopColor="#00101a" />
              </linearGradient>
            </defs>
            <rect width="240" height="100" fill="url(#nightGrad)" />

            {Array.from({ length: 12 }).map((_, i) => {
              const cx = Math.random() * 240;
              const cy = Math.random() * 100;
              const r = Math.random() * 1.3 + 0.4; // 0.4–1.7 px radius
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="#ffffff"
                  opacity="0.7"
                />
              );
            })}
          </svg>
        ) : (
          // Light mode: sky + clouds
          <svg
            viewBox="0 0 240 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#beeaf5" />
                <stop offset="100%" stopColor="#d4f5fc" />
              </linearGradient>
            </defs>
            <rect width="240" height="100" fill="url(#skyGrad)" />

            <g fill="#ffffff" opacity="0.85">
              <ellipse cx="60" cy="65" rx="25" ry="10" />
              <ellipse cx="100" cy="55" rx="35" ry="13" />
              <ellipse cx="160" cy="70" rx="30" ry="11" />
            </g>
          </svg>
        )}
      </div>

      {/* ─── KNOB: sun (r=10) or moon ───────────────────────────────── */}
      <span
        className={`
          relative 
          z-10 
          inline-block 
          h-6 w-6                /* knob: 24px × 24px */
          transform 
          rounded-full 
          bg-white 
          shadow-md 
          transition-transform
          ${theme === "dark" ? "translate-x-12" : "translate-x-1"}
        `}
      >
        {theme === "dark" ? (
          // ─── MOON (circle + crater details) ───────────────────────
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full text-gray-200"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="9" cy="9" r="2" fill="#cbd5e1" />
            <circle cx="14" cy="7" r="1.5" fill="#cbd5e1" />
            <circle cx="15" cy="14" r="1.2" fill="#cbd5e1" />
            <circle cx="10" cy="16" r="1" fill="#cbd5e1" />
          </svg>
        ) : (
          // ─── SUN (plain circle, r=10) ───────────────────────────────
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full text-yellow-400"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </span>
    </Switch>
  );
}
