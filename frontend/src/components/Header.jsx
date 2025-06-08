import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "./ConfirmModal";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", theme); } catch {
      console.log('');
    }
  }, [theme]);
  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const menuRef = useRef(null);
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        menuRef.current.open = false;
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <>
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Feature Flag Manager
        </h1>

        {/* single cog menu on all screen sizes */}
        <details ref={menuRef} className="relative">
          <summary className="list-none cursor-pointer p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700">
            <FontAwesomeIcon
              icon={faCog}
              className="text-gray-600 dark:text-gray-300 text-xl"
            />
          </summary>
          <div className="absolute right-0 mt-2 w-44 bg-gray-800 dark:bg-white  rounded-md shadow-lg z-50">
            <div className="flex flex-col divide-y divide-gray-700 dark:divide-gray-200">
              <button
                className="px-4 py-2 text-left text-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 rounded-md"
                onClick={() => {
                  toggleTheme();
                  closeMenu();
                }}
              >
                Toggle Theme
              </button>
              {token && (
                <button
                  onClick={() => {
                    closeMenu();
                    setShowLogoutConfirm(true);
                  }}
                  className="px-4 py-2 text-left bg-red-500 text-white hover:bg-red-600 transition-colors rounded-b-md"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </details>
      </header>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Confirm Logout"
          cancelText="Stay Logged In"
          confirmText="Log Out"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            handleLogout();
          }}
        >
          <p>Are you sure you want to log out?</p>
        </ConfirmModal>
      )}
    </>
  );
}
