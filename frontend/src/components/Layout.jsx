// src/components/Layout.jsx
import React from "react";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Feature Flag Management App
        </h1>

        {/** Insert the standalone ThemeToggle component here **/}
        <ThemeToggle />
      </header>

      <main className="flex-1 p-6">{children}</main>

      <footer className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        © 2024 Your Name
      </footer>
    </div>
  );
}
