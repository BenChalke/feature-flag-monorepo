// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import FilterTabs from "./components/FilterTabs";
import FlagTable from "./components/FlagTable";
import FlagForm from "./components/FlagForm";
import DeleteConfirm from "./components/DeleteConfirm";
import useAwsWebSocketFlags from "./hooks/useAwsWebSocketFlags";

export default function App() {
  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [deletingFlag, setDeletingFlag] = useState(null); // <-- new: which flag is pending deletion

  // 1) loadFlags
  const loadFlags = useCallback(async () => {
    console.log("[App] loadFlags() invoked…");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/flags`);
      if (!res.ok) throw new Error("Failed to fetch flags");
      const data = await res.json();
      console.log("[App] loadFlags got:", data);
      setFlags(data);
      setError(null);
    } catch (err) {
      console.error("[App] loadFlags error:", err);
      setError(err);
    }
  }, []);

  // 2) WebSocket hook (handles created/updated/deleted)
  useAwsWebSocketFlags(loadFlags);

  // 3) Initial load
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // 4) Toggle handler
  const handleToggle = useCallback(
    async (id, currentlyEnabled) => {
      console.log(
        `[App] handleToggle called for id=${id}, currentlyEnabled=${currentlyEnabled}`
      );
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
        console.error("[App] Toggle error:", err);
      }
    },
    [loadFlags]
  );

  // 5) DELETE handler (actual HTTP call)
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
        console.error("[App] Delete error:", err);
      }
    },
    [loadFlags]
  );

  // 6) When user clicks trash icon, show custom modal
  const handleRequestDelete = useCallback((flag) => {
    setDeletingFlag(flag);
  }, []);

  // 7) Loading / error states
  if (error) {
    return <div className="text-red-500 p-6">Failed to load flags.</div>;
  }
  if (!flags) {
    return <div className="p-6">Loading…</div>;
  }

  // 8) Filter by environment
  const envMap = { 0: "Production", 1: "Staging", 2: "Development" };
  const currentEnv = envMap[selectedTab];
  const filtered = flags.filter((f) => f.environment === currentEnv);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FilterTabs selected={selectedTab} onSelect={setSelectedTab} />

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">{currentEnv} Flags</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Create Flag
          </button>
        </div>

        <FlagTable
          flags={filtered}
          onToggle={handleToggle}
          onRequestDelete={handleRequestDelete} // <-- pass new callback
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

      {/* 9) Show DeleteConfirm modal if deletingFlag is set */}
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
    </div>
  );
}
