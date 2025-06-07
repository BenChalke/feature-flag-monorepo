// frontend/src/components/FlagTable.jsx

import React, { useState, useRef, useEffect } from "react";
import FlagRow from "./FlagRow";

export default function FlagTable({
  flags,
  loading,
  error,
  onToggle,
  onRequestDelete,
  onRowClick,
  sortField,
  sortDirection,
  onSort,
  selectedFlags,
  onSelectFlag,
  onSelectAll,
  onBulkEnable,
  onBulkDisable,
  onBulkDelete,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const allSelected =
    flags.length > 0 && flags.every(f => selectedFlags.includes(f.id));

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return <span className="ml-1 text-xs">{sortDirection === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <div className="overflow-x-auto -mx-2 sm:-mx-0 px-2 sm:px-0">
      <table className="
        w-full table-auto
        divide-y divide-gray-200 dark:divide-gray-700
        border-l border-r border-b border-gray-200 dark:border-gray-700
        rounded-b-lg
      ">
        <thead className="bg-gray-50 dark:bg-gray-800">
          {/* Bulk actions row */}
          <tr>
            <th colSpan={5} className="px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedFlags.length} selected
                </span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen(o => !o)}
                    className="inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Bulk actions <span className="ml-1 text-xs">{open ? "▲" : "▼"}</span>
                  </button>
                  {open && (
                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                      <button
                        onClick={() => { onBulkEnable(); setOpen(false); }}
                        disabled={!selectedFlags.length}
                        className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        Enable
                      </button>
                      <button
                        onClick={() => { onBulkDisable(); setOpen(false); }}
                        disabled={!selectedFlags.length}
                        className="w-full px-3 py-2 text-left text-sm text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        Disable
                      </button>
                      <button
                        onClick={() => { onBulkDelete(); setOpen(false); }}
                        disabled={!selectedFlags.length}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </th>
          </tr>

          {/* Column headers */}
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={e => onSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th
              onClick={() => onSort("name")}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Name<SortIcon field="name" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th
              onClick={() => onSort("created_at")}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors max-[450px]:hidden"
            >
              Created At<SortIcon field="created_at" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider max-[450px]:hidden">
              {/* delete */}
            </th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {flags.length === 0 && loading ? (
            <tr>
              <td colSpan={5} className="py-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-red-500">
                Failed to load flags.
              </td>
            </tr>
          ) : flags.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">
                No flags in this environment.
              </td>
            </tr>
          ) : (
            flags.map(flag => (
              <FlagRow
                key={flag.id}
                flag={flag}
                onToggle={onToggle}
                onRequestDelete={onRequestDelete}
                onRowClick={onRowClick}
                selected={selectedFlags.includes(flag.id)}
                onSelect={() => onSelectFlag(flag.id)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
