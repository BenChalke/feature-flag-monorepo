import React, { useState, useEffect, useCallback } from "react";
import FilterTabs from "./components/FilterTabs";
import FlagTable from "./components/FlagTable";
import FlagForm from "./components/FlagForm";
import DeleteConfirm from "./components/DeleteConfirm";
import MobileFlagModal from "./components/MobileFlagModal";
import useAwsWebSocketFlags from "./hooks/useAwsWebSocketFlags";

export default function App() {
  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deletingFlag, setDeletingFlag] = useState(null);
  const [mobileSelectedFlag, setMobileSelectedFlag] = useState(null);

  // 1) Fetch flags from the API
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

  // 2) Listen for WebSocket events to re-fetch
  useAwsWebSocketFlags(loadFlags);

  // 3) Initial load
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // 4) Toggle a flag’s enabled state
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

  // 5) Delete a flag
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

  // 6) When clicking the trash icon on desktop
  const handleRequestDelete = useCallback((flag) => {
    setDeletingFlag(flag);
  }, []);

  // 7) When tapping a row on mobile (≤ 450px)
  const handleRowClick = useCallback((flag) => {
    if (window.innerWidth <= 450) {
      setMobileSelectedFlag(flag);
    }
  }, []);

  // 8) Error / Loading states
  if (error) {
    return <div className="text-red-500 p-6">Failed to load flags.</div>;
  }
  if (!flags) {
    return <div className="p-6">Loading…</div>;
  }

  // 9) Only show flags matching the selected environment
  const envMap = { 0: "Production", 1: "Staging", 2: "Development" };
  const currentEnv = envMap[selectedTab];
  const envFlags = flags.filter((f) => f.environment === currentEnv);

  // 10) Further filter by search query (case‐insensitive substring match on name)
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFlags = normalizedQuery
    ? envFlags.filter((f) => f.name.toLowerCase().includes(normalizedQuery))
    : envFlags;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 space-y-6">
      {/* Tabs */}
      <FilterTabs selected={selectedTab} onSelect={setSelectedTab} />

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
            rounded-md
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-colors
          "
        />
      </div>

      {/* Flag table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 sm:mb-0">
            {currentEnv} Flags
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Create Flag
          </button>
        </div>

        <FlagTable
          flags={filteredFlags}
          onToggle={handleToggle}
          onRequestDelete={handleRequestDelete}
          onRowClick={handleRowClick}
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

      {/* Mobile‐only Flag Modal (toggle + delete) */}
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
