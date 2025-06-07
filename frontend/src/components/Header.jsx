// src/components/Header.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import ThemeToggle from "./ThemeToggle";
import ConfirmModal from "./ConfirmModal";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <>
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Feature Flag Manager
        </h1>

        {/* Desktop ≥450px */}
        <div className="flex items-center space-x-4 max-[450px]:hidden">
          <ThemeToggle />
          {token && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Log Out
            </button>
          )}
        </div>

        {/* Mobile ≤450px */}
        <div className="max-[450px]:block hidden">
          <details ref={menuRef} className="relative">
            <summary className="list-none cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <FontAwesomeIcon icon={faCog} className="text-gray-600 dark:text-gray-300 text-xl" />
            </summary>
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
              <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                <button
                  className="px-4 py-2 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    document.documentElement.classList.toggle("dark");
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
        </div>
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
