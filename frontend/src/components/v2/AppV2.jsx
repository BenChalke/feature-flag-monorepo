// frontend/src/components/v2/AppV2.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  fetcher,
  SessionExpiredError,
  FLAGS_ENDPOINT,
} from '../../api';
import useAwsWebSocketFlags from '../../hooks/useAwsWebSocketFlags';

import LayoutV2 from './LayoutV2';
import FeatureListV2 from './FeatureListV2';
import EditFlagModalV2 from './EditFlagModalV2';
import CreateFlagModalV2 from './CreateFlagModalV2';
import DeleteConfirmV2 from './DeleteConfirmV2';

export default function AppV2() {
  // ── STATE ───────────────────────────────────────────────────────────
  const [flags, setFlags] = useState([]);               
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firstLoad = useRef(true);

  const [createEnv, setCreateEnv] = useState('Development');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [updatingFlag, setUpdatingFlag] = useState(null);

  // delete-confirm state
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // **NEW** saving indicator for edit
  const [saving, setSaving] = useState(false);

  // ── LOAD FLAGS ──────────────────────────────────────────────────────
  const loadFlags = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetcher(FLAGS_ENDPOINT);
      const raw = Array.isArray(data) ? data : data.flags ?? data.items ?? [];
      setFlags(raw);
      setError(null);
    } catch (err) {
      console.error(err);
      if (!(err instanceof SessionExpiredError)) setError(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlags(true);
    firstLoad.current = false;
  }, [loadFlags]);

  // memoized WS handler
  const handleRealtimeUpdate = useCallback(() => loadFlags(false), [loadFlags]);
  useAwsWebSocketFlags(handleRealtimeUpdate);

  // ── TOGGLE FLAG ──────────────────────────────────────────────────────
  const handleToggleEnv = useCallback(
    async (id, currentlyEnabled) => {
      setUpdatingFlag(id);
      try {
        await fetcher(`${FLAGS_ENDPOINT}/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ enabled: !currentlyEnabled }),
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setUpdatingFlag(null);
        loadFlags(false);
      }
    },
    [loadFlags]
  );

  // ── EDIT MODAL ───────────────────────────────────────────────────────
  const openEditModal = useCallback(flag => {
    setEditingFlag(flag);
    setEditModalOpen(true);
  }, []);
  const closeEditModal = useCallback(() => {
    setEditingFlag(null);
    setEditModalOpen(false);
  }, []);

  const handleSaveFlag = useCallback(
    async ({ id, name, description = '', tags = [] }) => {
      setSaving(true);
      const modified_at = new Date().toISOString();
      try {
        await fetcher(`${FLAGS_ENDPOINT}/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, description, tags, modified_at }),
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setSaving(false);
        closeEditModal();
        loadFlags(false);
      }
    },
    [closeEditModal, loadFlags]
  );

  // ── DELETE FLOW ─────────────────────────────────────────────────────
  const requestDelete = useCallback((id, name) => {
    setConfirmDelete({ id, name });
  }, []);
  const confirmDeleteFlag = useCallback(async () => {
    if (!confirmDelete) return;
    setDeletingLoading(true);
    try {
      await fetcher(`${FLAGS_ENDPOINT}/${confirmDelete.id}`, { method: 'DELETE' });
      setError(null);
      closeEditModal();
      setConfirmDelete(null);
      loadFlags(false);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setDeletingLoading(false);
    }
  }, [confirmDelete, closeEditModal, loadFlags]);
  const cancelDelete = useCallback(() => setConfirmDelete(null), []);

  // ── CREATE MODAL ─────────────────────────────────────────────────────
  const openCreateModal = useCallback(env => {
    setCreateEnv(env);
    setCreateModalOpen(true);
  }, []);
  const closeCreateModal = useCallback(() => setCreateModalOpen(false), []);
  const handleCreateFlag = useCallback(
    async ({ name, environment, description = '', tags = [], enabled }) => {
      const timestamp = new Date().toISOString();
      try {
        await fetcher(FLAGS_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify({
            name,
            environment,
            enabled,
            created_at: timestamp,
            modified_at: timestamp,
            tags,
            description,
          }),
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        closeCreateModal();
        loadFlags(false);
      }
    },
    [closeCreateModal, loadFlags]
  );

  // ── RENDER ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <LayoutV2 onAddFlagClick={openCreateModal}>
        <div className="h-full flex items-center justify-center">
          <p className="text-red-500">{error.message}</p>
        </div>
      </LayoutV2>
    );
  }

  return (
    <>
      <LayoutV2 onAddFlagClick={openCreateModal}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading flags…</p>
          </div>
        ) : (
          <FeatureListV2
            flags={flags}
            onToggle={handleToggleEnv}
            onEdit={openEditModal}
            updatingFlag={updatingFlag}
          />
        )}
      </LayoutV2>

      <EditFlagModalV2
        isOpen={editModalOpen}
        flag={editingFlag}
        onClose={closeEditModal}
        onSave={handleSaveFlag}
        onRequestDelete={requestDelete}
        saving={saving}               // pass saving prop
      />

      <CreateFlagModalV2
        isOpen={createModalOpen}
        defaultEnv={createEnv}
        onClose={closeCreateModal}
        onCreate={handleCreateFlag}
      />

      {confirmDelete && (
        <DeleteConfirmV2
          flagName={confirmDelete.name}
          loading={deletingLoading}
          onCancel={cancelDelete}
          onConfirm={confirmDeleteFlag}
        />
      )}
    </>
  );
}
