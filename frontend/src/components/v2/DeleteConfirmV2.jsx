import React from "react";
import ConfirmModalV2 from "./ConfirmModalV2";

export default function DeleteConfirmV2({
  flagName,
  onCancel,
  onConfirm,
  loading = false,
}) {
  return (
    <ConfirmModalV2
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
    </ConfirmModalV2>
  );
}
