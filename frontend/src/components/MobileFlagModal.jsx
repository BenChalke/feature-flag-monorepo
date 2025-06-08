// src/components/MobileFlagModal.jsx
import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function MobileFlagModal({ flag, onClose, onToggle, onDelete }) {
  // local state
  const [enabled, setEnabled] = useState(flag?.enabled ?? false);
  const [deleting, setDeleting] = useState(false);

  // sync prop → state
  useEffect(() => {
    if (flag) {
      setEnabled(flag.enabled);
    }
  }, [flag?.enabled]);

  if (!flag) return null;

  const handleToggle = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    try {
      await onToggle(flag.id, newValue);
    } catch (err) {
      setEnabled(!newValue);
      console.error("Failed to toggle flag:", err);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(flag.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-xs mx-4 p-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {flag.name}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="
              text-gray-500 dark:text-gray-400
              hover:text-gray-700 dark:hover:text-gray-200
              text-2xl
              transition-colors
            "
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Created At */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Created:{" "}
          <span className="font-medium">
            {new Date(flag.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </span>
        </p>

        {/* Toggle Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            className={`
              ${enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors focus:outline-none
            `}
          >
            <span
              className={`
                ${enabled ? "translate-x-6" : "translate-x-1"}
                inline-block h-4 w-4 transform rounded-full bg-white
                transition-transform
              `}
            />
          </Switch>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`
            relative w-full px-4 py-2 bg-red-600 text-white rounded
            hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {deleting && (
            <div
              className="
                absolute inset-0 m-auto
                w-4 h-4
                border-2 border-white border-t-transparent
                rounded-full animate-spin
              "
              style={{ top: 0, bottom: 0, left: 0, right: 0 }}
            />
          )}
          <span className={deleting ? "opacity-0" : ""}>Delete Flag</span>
        </button>
      </div>
    </div>
  );
}
