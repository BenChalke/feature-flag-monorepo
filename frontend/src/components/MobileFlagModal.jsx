// src/components/MobileFlagModal.jsx
import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";

export default function MobileFlagModal({ flag, onClose, onToggle, onDelete }) {
  // 1) Local `enabled` state, initialized from `flag.enabled`.
  const [enabled, setEnabled] = useState(flag?.enabled ?? false);

  // 2) Whenever `flag.enabled` changes from the parent, sync it into local `enabled`.
  useEffect(() => {
    if (flag) {
      setEnabled(flag.enabled);
    }
  }, [flag?.enabled]);

  if (!flag) return null;

  // 3) When user clicks the switch, flip local state immediately (optimistic) 
  //    then call `onToggle` to let parent/DB know.
  const handleToggle = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    try {
      await onToggle(flag.id, newValue);
      // parent should eventually re‐fetch and ensure this flag really toggled.
    } catch (err) {
      // If it fails, revert local state so UI stays correct.
      setEnabled(enabled);
      console.error("Failed to toggle flag:", err);
    }
  };

  const handleDelete = async () => {
    await onDelete(flag.id);
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
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl transition-colors"
            aria-label="Close"
          >
            &times;
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
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Delete Flag
        </button>
      </div>
    </div>
  );
}
