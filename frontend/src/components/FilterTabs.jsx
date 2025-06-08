import React from "react";

export default function FilterTabs({ selected, onSelect }) {
  const tabs = ["Production", "Staging", "Development"];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8">
        {tabs.map((env, idx) => {
          const isActive = idx === selected;
          return (
            <button
              key={env}
              onClick={() => onSelect(idx)}
              className={`
                relative
                pb-2
                text-sm font-medium
                transition-colors

                ${isActive
                  ? "text-gray-900 dark:text-white border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
            >
              {env}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
