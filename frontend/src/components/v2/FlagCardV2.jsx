import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faServer,
  faGlobe,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

export default function FlagCardV2({
  flag,
  currentEnv,
  onToggle,
  onEdit,
  isUpdating,
}) {
  // only one env per card
  const { enabled } = flag.environments[currentEnv] || {};

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col justify-between">
      {/* Title + controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {flag.name}
        </h3>
        <div className="flex items-center space-x-4">
          {isUpdating && (
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-gray-500"
            />
          )}
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              className="sr-only peer focus:outline-none"
            />
            <div className="
              w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full
              peer-checked:bg-blue-600
              relative after:content-[''] after:absolute after:top-0.5 after:left-0.5
              after:bg-white after:border after:border-gray-300 after:rounded-full
              after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full
            " />
          </label>
          <button
            onClick={onEdit}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Tags */}
      {flag.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {flag.tags.map(t => (
            <span
              key={t}
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {flag.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {flag.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4">
          <span>Created: {new Date(flag.createdAt).toLocaleString()}</span>
          {flag.modifiedAt && (
            <span>Modified: {new Date(flag.modifiedAt).toLocaleString()}</span>
          )}
        </div>
        <div className="flex space-x-2">
          <FontAwesomeIcon
            icon={faCode}
            className={`w-4 h-4 ${
              currentEnv === 'Development' && enabled ? 'text-green-500' : 'text-gray-400'
            }`}
          />
          <FontAwesomeIcon
            icon={faServer}
            className={`w-4 h-4 ${
              currentEnv === 'Staging' && enabled ? 'text-green-500' : 'text-gray-400'
            }`}
          />
          <FontAwesomeIcon
            icon={faGlobe}
            className={`w-4 h-4 ${
              currentEnv === 'Production' && enabled ? 'text-green-500' : 'text-gray-400'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
