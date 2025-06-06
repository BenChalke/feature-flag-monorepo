// src/App.jsx
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
  const [showForm, setShowForm] = useState(false);
  const [deletingFlag, setDeletingFlag] = useState(null);
  const [mobileSelectedFlag, setMobileSelectedFlag] = useState(null);

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

  useAwsWebSocketFlags(loadFlags);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

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

  const handleRequestDelete = useCallback((flag) => {
    setDeletingFlag(flag);
  }, []);

  const handleRowClick = useCallback((flag) => {
    // Only open the mobile modal if viewport ≤450px.
    if (window.innerWidth <= 450) {
      setMobileSelectedFlag(flag);
    }
  }, []);

  // Error / loading states
  if (error) {
    return <div className="text-red-500 p-6">Failed to load flags.</div>;
  }
  if (!flags) {
    return <div className="p-6">Loading…</div>;
  }

  const envMap = { 0: "Production", 1: "Staging", 2: "Development" };
  const currentEnv = envMap[selectedTab];
  const filtered = flags.filter((f) => f.environment === currentEnv);

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 space-y-6">
      <FilterTabs selected={selectedTab} onSelect={setSelectedTab} />

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
          flags={filtered}
          onToggle={handleToggle}
          onRequestDelete={handleRequestDelete}
          onRowClick={handleRowClick}
        />
      </div>

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
