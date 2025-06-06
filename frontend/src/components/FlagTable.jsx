import React from "react";
import FlagRow from "./FlagRow";

export default function FlagTable({
  flags,
  onToggle,
  onRequestDelete,
  onRowClick,
  sortField,       // "name" or "created_at"
  sortDirection,   // "asc" or "desc"
  onSort,          // callback to change sorting
}) {
  if (!flags.length) {
    return (
      <div className="px-2 sm:px-0 py-4 text-center text-gray-500 dark:text-gray-400">
        No flags in this environment.
      </div>
    );
  }

  // Tiny ▲/▼ indicator next to the active sort column
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return (
      <span className="inline-block ml-1 text-xs">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto -mx-2 sm:-mx-0 px-2 sm:px-0">
      <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {/* NAME column – sortable */}
            <th
              onClick={() => onSort("name")}
              className="
                px-4 py-3 text-left text-xs font-medium
                text-gray-500 dark:text-gray-400 uppercase tracking-wider
                cursor-pointer select-none
                hover:text-gray-700 dark:hover:text-gray-200
                transition-colors
              "
            >
              Name
              <SortIcon field="name" />
            </th>

            {/* STATUS column (hidden on ≤450px) */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider max-[450px]:hidden">
              Status
            </th>

            {/* CREATED AT column – sortable */}
            <th
              onClick={() => onSort("created_at")}
              className="
                px-4 py-3 text-left text-xs font-medium
                text-gray-500 dark:text-gray-400 uppercase tracking-wider
                cursor-pointer select-none
                hover:text-gray-700 dark:hover:text-gray-200
                transition-colors
              "
            >
              Created At
              <SortIcon field="created_at" />
            </th>

            {/* DELETE column (hidden on ≤450px) */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider max-[450px]:hidden">
              {/* (no header text) */}
            </th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {flags.map((flag) => (
            <FlagRow
              key={flag.id}
              flag={flag}
              onToggle={onToggle}
              onRequestDelete={onRequestDelete}
              onRowClick={onRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
