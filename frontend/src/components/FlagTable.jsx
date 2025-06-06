// src/components/FlagTable.jsx
import FlagRow from "./FlagRow";

export default function FlagTable({ flags, onToggle, onRequestDelete }) {
  if (!flags.length) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No flags in this environment.
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created At
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {/* Empty header for delete column */}
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
          />
        ))}
      </tbody>
    </table>
  );
}
