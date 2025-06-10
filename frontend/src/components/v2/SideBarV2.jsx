// frontend/src/components/v2/SidebarV2.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faServer, faGlobe, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const ENVIRONMENTS = [
  { name: 'Development', icon: faCode, desc: 'Local development environment' },
  { name: 'Staging', icon: faServer, desc: 'Pre-production testing' },
  { name: 'Production', icon: faGlobe, desc: 'Live production environment' },
];

export default function SidebarV2({ activeEnv, onChange }) {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => setCollapsed((c) => !c);

  return (
    <div
      className={`h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <ul className={`mt-4 flex flex-col space-y-2 ${collapsed ? 'items-center' : ''}`}>  
        {/* Toggle button inline, aligned center when collapsed, end when expanded */}
        <li className={`w-full flex ${collapsed ? 'justify-center' : 'justify-end'}`}>  
          <button
            onClick={toggleCollapsed}
            className={`flex items-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              collapsed ? 'w-full justify-center p-3' : 'px-4 py-3 mx-2'
            }`}
            aria-label={collapsed ? 'chevron-right' : 'chevron-left'}
          >
            <FontAwesomeIcon
              icon={collapsed ? faChevronRight : faChevronLeft}
              className="w-5 h-5"
            />
          </button>
        </li>
        {/* Environments header when expanded */}
        {!collapsed && (
          <li>
            <h2 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Environments
            </h2>
          </li>
        )}
        {/* Environment items */}
        {ENVIRONMENTS.map((env) => {
          const isActive = env.name === activeEnv;
          return (
            <li key={env.name} className="w-full">
              <button
                onClick={() => onChange(env.name)}
                className={`flex w-full items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${collapsed ? 'justify-center' : 'justify-start'}`}
              >
                <FontAwesomeIcon icon={env.icon} className="w-5 h-5" />
                {!collapsed && (
                  <div className="text-left">
                    <div className="text-sm font-medium capitalize">{env.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{env.desc}</div>
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
