// frontend/src/components/v2/TopBarV2.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default function TopBarV2({ onAddFlagClick, currentEnv }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Feature Flags
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Environment: <span className="font-medium">{currentEnv}</span>
        </p>
      </div>
      <div className="flex items-center">
        <button
          onClick={onAddFlagClick}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
        >
          {/* Mobile: icon only; Desktop: icon + text */}
          <FontAwesomeIcon icon={faPlus} className="p-3" />
          <span className="hidden sm:inline pr-3 py-2 text-sm">Add Flag</span>
        </button>
      </div>
    </header>
  );
}
