// src/components/FlagRow.jsx
import { Switch } from "@headlessui/react";

export default function FlagRow({ flag, onToggle, onRequestDelete }) {
  // 1) Toggle handler (unchanged)
  const handleChange = async () => {
    await onToggle(flag.id, flag.enabled);
  };

  // 2) Instead of deleting immediately, call onRequestDelete(flag)
  const handleDeleteClick = () => {
    onRequestDelete(flag);
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      {/* Flag Name */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {flag.name}
      </td>

      {/* Status Toggle */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Switch
          checked={flag.enabled}
          onChange={handleChange}
          className={`${
            flag.enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
        >
          <span
            className={`${
              flag.enabled ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </td>

      {/* Created At */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(flag.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })}
      </td>

      {/* Delete Icon */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
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
              d="M6 7h12M9 7v-1a2 2 0 00-2-2H7a2 2 0 00-2 2v1m4 0v12m4-12v12m4-12v12M5 7h14l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7z"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}
