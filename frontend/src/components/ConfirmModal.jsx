import React from "react";

export default function ConfirmModal({
  title,
  children,
  cancelText = "Cancel",
  confirmText = "Confirm",
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-4 sm:mx-0 p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-4">
          {children}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
