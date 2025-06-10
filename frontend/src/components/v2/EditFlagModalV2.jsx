// frontend/src/components/v2/EditFlagModalV2.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { EnvContext } from './LayoutV2';

export default function EditFlagModalV2({
  isOpen,
  flag,
  onClose,
  onSave,
  onRequestDelete,
  saving = false,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsString, setTagsString] = useState('');

  useEffect(() => {
    if (flag) {
      setName(flag.name);
      setDescription(flag.description || '');
      setTagsString((flag.tags || []).join(', '));
    }
  }, [flag]);

  if (!isOpen || !flag) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    onSave({
      id: flag.id,
      name: name.trim(),
      description: description.trim(),
      tags,
    });
  };

  const handleDelete = () => {
    onRequestDelete(flag.id, flag.name);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Edit Flag
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={e => setTagsString(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-4">
            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition focus:outline-none"
            >
              Delete
            </button>
            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition focus:outline-none"
            >
              Cancel
            </button>
            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="relative px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition focus:outline-none disabled:opacity-50"
            >
              {saving && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              )}
              <span className={saving ? 'opacity-0' : ''}>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
