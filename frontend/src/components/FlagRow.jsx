// src/components/FlagRow.jsx
import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export default function FlagRow({
  flag,
  onToggle,
  onRequestDelete,
  onOpenMenu,
  selected,   // boolean
  onSelect,   // fn toggles selection
}) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(flag.id, flag.enabled);
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onRequestDelete(flag);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    onOpenMenu(flag);
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      {/* bulk‐select */}
      <td className="px-4 py-3 w-[55px]">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
      </td>

      {/* NAME */}
      <td
        className="
          px-4 py-3
          text-sm text-gray-900 dark:text-gray-100
          truncate overflow-hidden whitespace-nowrap
          max-w-[100px] sm:max-w-xs
        "
      >
        {flag.name}
      </td>

      {/* STATUS */}
      <td className="px-4 py-3 w-[50px] text-center text-sm relative">
        <div className="inline-block relative">
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
          {toggling && (
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </td>

      {/* CREATED AT (desktop only) */}
      <td
        className="
          px-4 py-3 text-sm text-gray-500 dark:text-gray-400
          max-[450px]:hidden whitespace-nowrap w-[120px]
        "
      >
        {new Date(flag.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })}
      </td>

      {/* DELETE (desktop only) */}
      <td className="px-4 py-3 text-right text-sm w-[55px] max-[450px]:hidden">
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

      {/* MORE (mobile only) */}
      <td className="hidden max-[450px]:table-cell px-4 py-3 text-right text-sm w-[40px]">
        <button
          onClick={handleMoreClick}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
          aria-label={`More actions for ${flag.name}`}
        >
          <FontAwesomeIcon icon={faEllipsisV} size="lg" />
        </button>
      </td>
    </tr>
  );
}
