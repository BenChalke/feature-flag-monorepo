// src/components/Layout.jsx
import React from "react";
import useDarkMode from "../hooks/useDarkMode";

export default function Layout({ children }) {
  const [theme, toggleTheme] = useDarkMode();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Feature Flag Management App</h1>
        <button
          onClick={toggleTheme}
          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
        </button>
      </header>

      <main className="flex-1 p-6">{children}</main>

      <footer className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        © 2025 Ben Chalke
      </footer>
    </div>
  );
}
