// frontend/src/App.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import FilterTabs from "./components/FilterTabs";
import FlagTable from "./components/FlagTable";
import FlagForm from "./components/FlagForm";
import DeleteConfirm from "./components/DeleteConfirm";
import MobileFlagModal from "./components/MobileFlagModal";
import useAwsWebSocketFlags from "./hooks/useAwsWebSocketFlags";
import { fetcher, FLAGS_ENDPOINT } from "./api";

export default function App() {
  // ─── STATE & HOOK SETUP ──────────────────────────────────────────
  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [deletingFlag, setDeletingFlag] = useState(null);
  const [mobileSelectedFlag, setMobileSelectedFlag] = useState(null);

  // ─── FETCH FLAGS ─────────────────────────────────────────────────
  const loadFlags = useCallback(async () => {
    try {
      const data = await fetcher(FLAGS_ENDPOINT);
      setFlags(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }, []);

  // re-fetch on WebSocket events
  useAwsWebSocketFlags(loadFlags);

  // initial fetch
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // ─── TOGGLE ───────────────────────────────────────────────────────
  const handleToggle = useCallback(
    async (id, currentlyEnabled) => {
      try {
        await fetcher(`${FLAGS_ENDPOINT}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: !currentlyEnabled }),
        });
        await loadFlags();
      } catch (err) {
        console.error(err);
      }
    },
    [loadFlags]
  );

  // ─── DELETE ───────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id) => {
      try {
        await fetcher(`${FLAGS_ENDPOINT}/${id}`, { method: "DELETE" });
        await loadFlags();
      } catch (err) {
        console.error(err);
      }
    },
    [loadFlags]
  );

  const handleRequestDelete = useCallback((flag) => {
    setDeletingFlag(flag);
  }, []);

  const handleRowClick = useCallback((flag) => {
    if (window.innerWidth <= 450) {
      setMobileSelectedFlag(flag);
    }
  }, []);

  // ─── FILTER & SORT ────────────────────────────────────────────────
  const envMap = { 0: "Production", 1: "Staging", 2: "Development" };
  const currentEnv = envMap[selectedTab];

  const envFlags = flags
    ? flags.filter((f) => f.environment === currentEnv)
    : [];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedFlags = normalizedQuery
    ? envFlags.filter((f) =>
        f.name.toLowerCase().includes(normalizedQuery)
      )
    : envFlags;

  const sortedFlags = useMemo(() => {
    const copy = [...searchedFlags];
    copy.sort((a, b) => {
      let aVal, bVal;
      if (sortField === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [searchedFlags, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ─── EARLY RETURNS ────────────────────────────────────────────────
  if (error)
    return <div className="text-red-500 p-6">Failed to load flags.</div>;
  if (!flags) return <div className="p-6">Loading…</div>;

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 space-y-6">
      <FilterTabs
        selected={selectedTab}
        onSelect={setSelectedTab}
      />

      {/* Search bar */}
      <div className="flex justify-end px-2 sm:px-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search flags…"
          className="
            block w-full sm:w-1/3
            px-3 py-2
            border border-gray-300 dark:border-gray-700
            rounded-md bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-colors
          "
        />
      </div>

      {/* Table + Create Button */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {currentEnv} Flags
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="
              relative inline-flex items-center justify-center
              bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none

              /* default padding */
              px-4 py-2

              /* ≤400px: fixed 32×32, hide text */
              max-[400px]:w-8 max-[400px]:h-8 max-[400px]:px-0 max-[400px]:py-0
            "
          >
            <span className="inline max-[400px]:hidden">+ Create Flag</span>
            <span className="hidden max-[400px]:inline text-lg leading-none">+</span>
          </button>
        </div>

        <FlagTable
          flags={sortedFlags}
          onToggle={handleToggle}
          onRequestDelete={handleRequestDelete}
          onRowClick={handleRowClick}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Create Modal */}
      {showForm && (
        <FlagForm
          initialEnv={currentEnv}
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            await loadFlags();
            setShowForm(false);
          }}
        />
      )}

      {/* Desktop Delete Confirm */}
      {deletingFlag && (
        <DeleteConfirm
          flagName={deletingFlag.name}
          onCancel={() => setDeletingFlag(null)}
          onConfirm={async () => {
            await handleDelete(deletingFlag.id);
            setDeletingFlag(null);
          }}
        />
      )}

      {/* Mobile Modal */}
      {mobileSelectedFlag && (
        <MobileFlagModal
          flag={mobileSelectedFlag}
          onClose={() => setMobileSelectedFlag(null)}
          onToggle={handleToggle}
          onDelete={async (id) => {
            await handleDelete(id);
            setMobileSelectedFlag(null);
          }}
        />
      )}
    </div>
  );
}
