import React, { useContext, useState, useMemo } from 'react';
import FlagCardV2 from './FlagCardV2';
import { EnvContext } from './LayoutV2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpWideShort } from '@fortawesome/free-solid-svg-icons';

export default function FeatureListV2({
  flags = [],        // raw rows
  onToggle,         // now expects (id, currentlyEnabled)
  onEdit,
  updatingFlag,
}) {
  const envName = useContext(EnvContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created');
  const [sortDir, setSortDir] = useState('asc');

  const envRows = useMemo(
    () => flags.filter(f => f.environment === envName),
    [flags, envName]
  );

  const searched = useMemo(
    () =>
      envRows.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [envRows, searchTerm]
  );

  const sorted = useMemo(() => {
    const arr = [...searched];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else {
        const aDate = Date.parse(
          sortField === 'modified'
            ? (a.modified_at || a.created_at)
            : a.created_at
        ) || 0;
        const bDate = Date.parse(
          sortField === 'modified'
            ? (b.modified_at || b.created_at)
            : b.created_at
        ) || 0;
        cmp = aDate - bDate;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [searched, sortField, sortDir]);

  return (
    <section className="space-y-6">
      {/* Header + controls */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4">
        <h2 className="flex-shrink min-w-[200px] text-lg font-semibold text-gray-900 dark:text-gray-100 text-center sm:text-left">
          {envName} Environment
        </h2>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search flags..."
            className="w-full sm:w-[250px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="w-full sm:w-[250px] flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-300">Sort:</span>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 mx-2 focus:outline-none"
            >
              <option value="created">Created</option>
              <option value="modified">Modified</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
              className="focus:outline-none"
              aria-label="Toggle sort direction"
            >
              <FontAwesomeIcon
                icon={faArrowUpWideShort}
                className={`text-gray-700 dark:text-gray-300 transform ${
                  sortDir === 'desc' ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Flag cards */}
      <div className="grid gap-6">
        {sorted.length > 0 ? (
          sorted.map(row => (
            <FlagCardV2
              key={row.id}
              flag={{
                name: row.name,
                createdAt: row.created_at,
                modifiedAt: row.modified_at,
                description: row.description,
                tags: row.tags || [],
                environments: {
                  [envName]: { id: row.id, enabled: row.enabled },
                },
              }}
              currentEnv={envName}
              onToggle={() => onToggle(row.id, row.enabled)}
              onEdit={() => onEdit(row)}
              isUpdating={row.id === updatingFlag}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No flags found.
          </p>
        )}
      </div>
    </section>
  );
}
