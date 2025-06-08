import React from "react";

export default function SessionExpiredModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm mx-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Session Expired
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Your session has expired. Please log in again to continue.
        </p>
        <button
          onClick={onClose}
          className="
            px-4 py-2
            bg-blue-600 text-white rounded
            hover:bg-blue-700 transition-colors
            focus:outline-none
          "
        >
          OK
        </button>
      </div>
    </div>
  );
}
