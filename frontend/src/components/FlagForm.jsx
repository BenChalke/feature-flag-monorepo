// frontend/src/components/FlagForm.jsx

import React, { useState } from "react";
import { fetcher } from "../api";

export default function FlagForm({ initialEnv, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState(initialEnv);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await fetcher(`${import.meta.env.VITE_API_BASE}/flags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), environment }),
      });
      // WAIT for onCreated (which reloads flags and then closes the modal)
      await onCreated();
    } catch (err) {
      setError(err.info?.error || err.message || "Failed to create flag");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-4 sm:mx-0 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Create Feature Flag
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="flagName"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <input
              id="flagName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Environment */}
          <div>
            <label
              htmlFor="environment"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Environment
            </label>
            <select
              id="environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`
                relative flex items-center justify-center
                h-10 px-4
                text-white rounded transition-colors
                ${loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"}
              `}
            >
              {/* spinner */}
              {loading && (
                <div className="absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {/* keep text invisible when loading so size doesn’t shift */}
              <span className={loading ? "opacity-0" : ""}>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
