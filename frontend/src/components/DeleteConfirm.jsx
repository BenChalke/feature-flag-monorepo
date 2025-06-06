// src/components/DeleteConfirm.jsx
import React from "react";

export default function DeleteConfirm({ flagName, onCancel, onConfirm }) {
  return (
    // Use bg-black/30 for 30% opacity instead of bg-opacity-*
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Delete Feature Flag
          </h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the flag{" "}
          <span className="font-semibold">{flagName}</span>?
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
