// src/components/MobileFlagModal.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "./ConfirmModal";

export default function MobileFlagModal({ flag, onClose, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!flag) return null;

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(flag.id);
      // once deleted, close both modals
      setConfirmOpen(false);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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

          {/* Delete Button */}
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete Flag
          </button>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Delete Feature Flag"
          cancelText="Cancel"
          confirmText="Delete"
          loading={deleting}
          onCancel={() => {
            if (!deleting) setConfirmOpen(false);
          }}
          onConfirm={handleConfirmDelete}
        >
          <p>
            Are you sure you want to delete the flag{" "}
            <span className="font-semibold">{flag.name}</span>?
          </p>
        </ConfirmModal>
      )}
    </>
  );
}
