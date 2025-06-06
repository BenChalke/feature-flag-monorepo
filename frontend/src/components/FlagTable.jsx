import React from "react";
import FlagRow from "./FlagRow";

export default function FlagTable({
  flags,
  onToggle,
  onRequestDelete,
  onRowClick,
}) {
  if (!flags.length) {
    return (
      <div className="px-2 sm:px-0 py-4 text-center text-gray-500 dark:text-gray-400">
        No flags in this environment.
      </div>
    );
  }

  return (
    // On very small screens (≤450px): allow horizontal scroll + side padding
    <div className="overflow-x-auto -mx-2 sm:-mx-0 px-2 sm:px-0">
      <table
        className="
          w-full 
          table-auto 
          max-[450px]:table-fixed 
          divide-y divide-gray-200 dark:divide-gray-700
        "
      >
        <colgroup>
          {/* 
            Name column:
              - At ≤450px: w-1/2 
              - At ≥451px: auto 
          */}
          <col className="w-auto max-[450px]:w-1/2" />

          {/* Status column (hide ≤450px, auto width otherwise) */}
          <col className="w-auto max-[450px]:hidden" />

          {/* 
            Created At column:
              - At ≤450px: w-1/2 
              - At ≥451px: auto 
          */}
          <col className="w-auto max-[450px]:w-1/2" />

          {/* Delete column (hide ≤450px, auto width otherwise) */}
          <col className="w-auto max-[450px]:hidden" />
        </colgroup>

        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-[450px]:hidden">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-[450px]:hidden">
              {/* Delete */}
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
