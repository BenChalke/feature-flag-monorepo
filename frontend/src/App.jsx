// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import FilterTabs from "./components/FilterTabs";
import FlagTable from "./components/FlagTable";
import FlagForm from "./components/FlagForm";
import DeleteConfirm from "./components/DeleteConfirm";
import MobileFlagModal from "./components/MobileFlagModal";
import useAwsWebSocketFlags from "./hooks/useAwsWebSocketFlags";

export default function App() {
  //
  // 1) STATE + HOOK SETUP (all hooks must be at top level)
  //
  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");       // "name" or "created_at"
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
  const [showForm, setShowForm] = useState(false);
  const [deletingFlag, setDeletingFlag] = useState(null);
  const [mobileSelectedFlag, setMobileSelectedFlag] = useState(null);

  // 2) FETCH FLAGS from API
  const loadFlags = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/flags`);
      if (!res.ok) throw new Error("Failed to fetch flags");
      const data = await res.json();
      setFlags(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }, []);

  // 3) RE‐FETCH ON WEBSOCKET EVENTS
  useAwsWebSocketFlags(loadFlags);

  // 4) INITIAL FETCH
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // 5) TOGGLE FLAG (PATCH)
  const handleToggle = useCallback(
    async (id, currentlyEnabled) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/flags/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: !currentlyEnabled }),
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Toggle failed");
        }
        await loadFlags();
      } catch (err) {
        console.error(err);
      }
    },
    [loadFlags]
  );

  // 6) DELETE FLAG (DELETE)
  const handleDelete = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/flags/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Delete failed");
        }
        await loadFlags();
      } catch (err) {
        console.error(err);
      }
    },
    [loadFlags]
  );

  // 7) REQUEST DELETE (desktop click on trash icon)
  const handleRequestDelete = useCallback((flag) => {
    setDeletingFlag(flag);
  }, []);

  // 8) ROW CLICK FOR MOBILE (≤ 450px)
  const handleRowClick = useCallback((flag) => {
    if (window.innerWidth <= 450) {
      setMobileSelectedFlag(flag);
    }
  }, []);

  //
  // 9) FILTER + SORT LOGIC (all hooks/unconditional)
  //
  // 9a) Map tab index → environment string
  const envMap = { 0: "Production", 1: "Staging", 2: "Development" };
  const currentEnv = envMap[selectedTab];

  // 9b) Filter flags by selected environment (if flags is not null)
  const envFlags = flags
    ? flags.filter((f) => f.environment === currentEnv)
    : [];

  // 9c) Further filter by search query (case‐insensitive match on name)
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedFlags = normalizedQuery
    ? envFlags.filter((f) => f.name.toLowerCase().includes(normalizedQuery))
    : envFlags;

  // 9d) Sort the filtered flags using useMemo
  const sortedFlags = useMemo(() => {
    // Always work on a shallow copy
    const copy = [...searchedFlags];
    copy.sort((a, b) => {
      let aVal, bVal;

      if (sortField === "name") {
        // Compare names alphabetically (case‐insensitive)
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        // Compare timestamps for created_at
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [searchedFlags, sortField, sortDirection]);

  // 9e) Change sort when a column header is clicked
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction on same field
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      // New field → default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  //
  // 10) EARLY RETURNS (after all hooks + useMemo)
  //
  if (error) {
    return <div className="text-red-500 p-6">Failed to load flags.</div>;
  }
  if (!flags) {
    return <div className="p-6">Loading…</div>;
  }

  //
  // 11) RENDER UI
  //
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 space-y-6">
      {/* Tabs */}
      <FilterTabs selected={selectedTab} onSelect={setSelectedTab} />

      {/* Search */}
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
            rounded-md
            bg-white dark:bg-gray-900
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

            /* default: enough padding for “+ Create Flag” */
            px-4 py-2

            /* ≤400px: fix to 32×32 and remove padding */
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

      {/* Create Flag Modal */}
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

      {/* Desktop Delete Confirmation */}
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

      {/* Mobile‐only Flag Modal */}
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
