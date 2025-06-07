// src/components/Layout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Feature Flag Manager
        </h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-6">{children}</main>

      <footer className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
        © 2025 Ben Chalke
      </footer>
    </div>
  );
}
