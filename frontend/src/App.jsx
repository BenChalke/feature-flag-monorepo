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
  // ─── STATE ────────────────────────────────────────────────────────
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [deletingFlag, setDeletingFlag] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [mobileSelectedFlag, setMobileSelectedFlag] = useState(null);

  // bulk‐select state
  const [selectedFlags, setSelectedFlags] = useState([]);

  // bulk endpoints
  const BULK_UPDATE_ENDPOINT = `${FLAGS_ENDPOINT}/bulk-update`;
  const BULK_DELETE_ENDPOINT = `${FLAGS_ENDPOINT}/bulk-delete`;

  // ─── FETCH FLAGS ──────────────────────────────────────────────────
  const loadFlags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetcher(FLAGS_ENDPOINT);
      setFlags(data);
      setError(null);
      // drop any selections that no longer exist
      setSelectedFlags((prev) =>
        data.map((f) => f.id).filter((id) => prev.includes(id))
      );
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // re-fetch when WebSocket notifies
  useAwsWebSocketFlags(loadFlags);

  // initial load
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // ─── SINGLE TOGGLE ────────────────────────────────────────────────
  const handleToggle = useCallback(
    async (id, currentlyEnabled) => {
      try {
        await fetcher(`${FLAGS_ENDPOINT}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: !currentlyEnabled }),
        });
        loadFlags();
      } catch (err) {
        console.error(err);
      }
    },
    [loadFlags]
  );

  // ─── SINGLE DELETE ────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id) => {
      try {
        await fetcher(`${FLAGS_ENDPOINT}/${id}`, { method: "DELETE" });
        loadFlags();
      } catch (err) {
        console.error(err);
      }
    },
    [loadFlags]
  );

  // ─── BULK ACTIONS ─────────────────────────────────────────────────
  const handleSelectFlag = (id) => {
    setSelectedFlags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      // select every flag currently shown in the table
      setSelectedFlags(sortedFlags.map((f) => f.id));
    } else {
      setSelectedFlags([]);
    }
  };

  const bulkEnable = async () => {
    try {
      await fetcher(BULK_UPDATE_ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedFlags, enabled: true }),
      });
      setSelectedFlags([]);
      loadFlags();
    } catch (err) {
      console.error(err);
    }
  };

  const bulkDisable = async () => {
    try {
      await fetcher(BULK_UPDATE_ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedFlags, enabled: false }),
      });
      setSelectedFlags([]);
      loadFlags();
    } catch (err) {
      console.error(err);
    }
  };

  const bulkDelete = async () => {
    try {
      await fetcher(BULK_DELETE_ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedFlags }),
      });
      setSelectedFlags([]);
      loadFlags();
    } catch (err) {
      console.error(err);
    }
  };

  // ─── DELETE CONFIRM & MOBILE MENU ─────────────────────────────────
  const handleRequestDelete = useCallback((flag) => {
    setDeletingFlag(flag);
  }, []);

  const handleOpenRowMenu = useCallback((flag) => {
    setMobileSelectedFlag(flag);
  }, []);

  // ─── FILTER & SORT ────────────────────────────────────────────────
  const envMap = { 0: "Production", 1: "Staging", 2: "Development" };
  const currentEnv = envMap[selectedTab];
  const envFlags = flags.filter((f) => f.environment === currentEnv);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedFlags = normalizedQuery
    ? envFlags.filter((f) => f.name.toLowerCase().includes(normalizedQuery))
    : envFlags;

  const sortedFlags = useMemo(() => {
    const copy = [...searchedFlags];
    copy.sort((a, b) => {
      const aVal =
        sortField === "name"
          ? a.name.toLowerCase()
          : new Date(a.created_at).getTime();
      const bVal =
        sortField === "name"
          ? b.name.toLowerCase()
          : new Date(b.created_at).getTime();
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

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 space-y-4">
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
        {/* header */}
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {currentEnv} Flags
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="
              relative inline-flex items-center justify-center
              bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none
              px-4 py-2
              max-[400px]:w-8 max-[400px]:h-8 max-[400px]:px-0 max-[400px]:py-0
            "
          >
            <span className="inline max-[400px]:hidden">+ Create Flag</span>
            <span className="hidden max-[400px]:inline text-lg leading-none">
              +
            </span>
          </button>
        </div>

        {/* table body */}
        <FlagTable
          flags={sortedFlags}
          loading={loading}
          error={error}
          onToggle={handleToggle}
          onRequestDelete={handleRequestDelete}
          onOpenRowMenu={handleOpenRowMenu}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          selectedFlags={selectedFlags}
          onSelectFlag={handleSelectFlag}
          onSelectAll={handleSelectAll}
          onBulkEnable={bulkEnable}
          onBulkDisable={bulkDisable}
          onBulkDelete={bulkDelete}
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
          loading={deletingLoading}
          onCancel={() => {
            if (!deletingLoading) setDeletingFlag(null);
          }}
          onConfirm={async () => {
            setDeletingLoading(true);
            try {
              await handleDelete(deletingFlag.id);
            } finally {
              setDeletingLoading(false);
              setDeletingFlag(null);
            }
          }}
        />
      )}

      {/* Mobile Modal */}
      {mobileSelectedFlag && (
        <MobileFlagModal
          flag={mobileSelectedFlag}
          onClose={() => setMobileSelectedFlag(null)}
          onDelete={async (id) => {
            await handleDelete(id);
            setMobileSelectedFlag(null);
          }}
        />
      )}
    </div>
  );
}
