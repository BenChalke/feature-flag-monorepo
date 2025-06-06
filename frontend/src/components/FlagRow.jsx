// src/components/FlagRow.jsx
import React from "react";
import { Switch } from "@headlessui/react";

export default function FlagRow({
  flag,
  onToggle,
  onRequestDelete,
  onRowClick,
}) {
  const handleToggle = async () => {
    await onToggle(flag.id, flag.enabled);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onRequestDelete(flag);
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
      {/* ─── NAME cell: only this cell opens the modal ──────────────────── */}
      <td
        className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 truncate"
        onClick={() => onRowClick(flag)}
      >
        {flag.name}
      </td>

      {/* ─── STATUS cell (always visible, even on mobile) ───────────────── */}
      <td className="px-4 py-3 text-sm">
        <Switch
          checked={flag.enabled}
          onChange={handleToggle}
          className={`
            ${flag.enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors focus:outline-none
          `}
        >
          <span
            className={`
              ${flag.enabled ? "translate-x-6" : "translate-x-1"}
              inline-block h-4 w-4 transform rounded-full bg-white
              transition-transform
            `}
          />
        </Switch>
      </td>

      {/* ─── CREATED AT cell (hidden on mobile ≤ 450px) ──────────────────── */}
      <td
        className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400
                   max-[450px]:hidden whitespace-nowrap"
      >
        {new Date(flag.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })}
      </td>

      {/* ─── DELETE cell (hidden on mobile ≤ 450px) ──────────────────────── */}
      <td className="px-4 py-3 text-right text-sm max-[450px]:hidden">
        <button
          onClick={handleDeleteClick}
          className="text-gray-400 hover:text-red-600 focus:outline-none"
          aria-label={`Delete ${flag.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 7h12M9 7v-1a2 2 0 00-2-2H7a2 2 0 00-2 2v1m4 0v12m4-12v12m4-12v12M5 7h14l-1 14a2 2 0 01-2 2H8a2 2 0 01-2 2L5 7z"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}
