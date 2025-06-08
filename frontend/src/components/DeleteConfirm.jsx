import React from "react";
import ConfirmModal from "./ConfirmModal";

// now accepts a `loading` prop too
export default function DeleteConfirm({
  flagName,
  onCancel,
  onConfirm,
  loading = false,
}) {
  return (
    <ConfirmModal
      title="Delete Feature Flag"
      cancelText="Cancel"
      confirmText="Delete"
      onCancel={onCancel}
      onConfirm={onConfirm}
      loading={loading}
    >
      <p>
        Are you sure you want to delete the flag{" "}
        <span className="font-semibold">{flagName}</span>?
      </p>
    </ConfirmModal>
  );
}
