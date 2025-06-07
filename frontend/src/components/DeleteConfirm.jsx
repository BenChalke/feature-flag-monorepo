import React from "react";
import ConfirmModal from "./ConfirmModal";

export default function DeleteConfirm({ flagName, onCancel, onConfirm }) {
  return (
    <ConfirmModal
      title="Delete Feature Flag"
      cancelText="Cancel"
      confirmText="Delete"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p>
        Are you sure you want to delete the flag{" "}
        <span className="font-semibold">{flagName}</span>?
      </p>
    </ConfirmModal>
  );
}
