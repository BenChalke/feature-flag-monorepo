// frontend/src/components/v2/CreateFlagModalV2.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { EnvContext } from './LayoutV2';

const ENVIRONMENTS = ['Development', 'Staging', 'Production'];

export default function CreateFlagModalV2({
  isOpen,
  onClose,
  onCreate,
  defaultEnv,
}) {
  const currentEnv = useContext(EnvContext) || 'Development';
  const initialEnv = defaultEnv || currentEnv;

  const [formData, setFormData] = useState({
    name: '',
    environment: initialEnv,
    description: '',
    tags: '',
    enabled: false,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ddRef = useRef(null);

  // reset on open
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        environment: initialEnv,
        description: '',
        tags: '',
        enabled: false,
      });
      setDropdownOpen(false);
    }
  }, [isOpen, initialEnv]);

  // close dropdown if clicked outside
  useEffect(() => {
    function onClick(e) {
      if (ddRef.current && !ddRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-visible">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6 overflow-visible">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create New Flag
          </h2>
          <button
            onClick={onClose}
            aria-label="times"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            onCreate({
              name: formData.name.trim(),
              environment: formData.environment,
              description: formData.description.trim(),
              tags: formData.tags
                .split(',')
                .map(t => t.trim())
                .filter(Boolean),
              enabled: formData.enabled,
            });
          }}
          className="space-y-6"
        >
          {/* Name */}
          <div>
            <label htmlFor="flag-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              id="flag-name"
              type="text"
              required
              value={formData.name}
              onChange={e =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            />
          </div>

          {/* Environment (custom dropdown) */}
          <div ref={ddRef}>
            <label htmlFor="flag-env" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Environment
            </label>
            <div className="mt-1 relative">
              <button
                id="flag-env"
                type="button"
                onClick={() => setDropdownOpen(o => !o)}
                className="w-full flex justify-between items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-left text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{formData.environment}</span>
                <FontAwesomeIcon
                  icon={dropdownOpen ? faChevronUp : faChevronDown}
                  className="text-gray-500 dark:text-gray-300"
                />
              </button>
              {dropdownOpen && (
                <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                  {ENVIRONMENTS.map(env => (
                    <li key={env}>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, environment: env });
                          setDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        {env}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="flag-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="flag-desc"
              rows={4}
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="flag-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (comma-separated)
            </label>
            <input
              id="flag-tags"
              type="text"
              value={formData.tags}
              onChange={e =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            />
          </div>

          {/* Enabled */}
          <div className="flex items-center space-x-2">
            <input
              id="flag-enabled"
              type="checkbox"
              checked={formData.enabled}
              onChange={e =>
                setFormData({ ...formData, enabled: e.target.checked })
              }
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="flag-enabled"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Enabled by default
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
