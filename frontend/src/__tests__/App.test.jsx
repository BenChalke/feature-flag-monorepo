// src/__tests__/App.test.jsx

// 1) Mock the api module before any imports
jest.mock('../api', () => {
  const original = jest.requireActual('../api');
  return {
    ...original,
    FLAGS_ENDPOINT: '/flags',
    fetcher: jest.fn(),
  };
});

// 2) Prepare props captures
let lastFilterProps;
let lastTableProps;
let lastFormProps;
let lastDeleteConfirmProps;
let lastMobileModalProps;

// 3) Stub out child components, capturing their props
jest.mock('../components/FilterTabs', () => props => {
  lastFilterProps = props;
  return <div data-testid="stub-filter-tabs" />;
});
jest.mock('../components/FlagTable', () => props => {
  lastTableProps = props;
  return <div data-testid="stub-flag-table" />;
});
jest.mock('../components/FlagForm', () => props => {
  lastFormProps = props;
  return <div data-testid="stub-flag-form" />;
});
jest.mock('../components/DeleteConfirm', () => props => {
  lastDeleteConfirmProps = props;
  return <div data-testid="stub-delete-confirm" />;
});
jest.mock('../components/MobileFlagModal', () => props => {
  lastMobileModalProps = props;
  return <div data-testid="stub-mobile-modal" />;
});

import React from 'react';
import { render, act, fireEvent, screen } from '@testing-library/react';
import App from '../App';
import * as api from '../api';

beforeEach(() => {
  api.fetcher.mockReset();
  lastFilterProps =
    lastTableProps =
    lastFormProps =
    lastDeleteConfirmProps =
    lastMobileModalProps =
      null;
  localStorage.clear();
});

describe('App component (stubbed children)', () => {
  it('loads flags on mount and passes only Production flags to FlagTable', async () => {
    const now = new Date().toISOString();
    const allFlags = [
      { id: 'p1', name: 'ProdFlag', enabled: true, environment: 'Production', created_at: now },
      { id: 's1', name: 'StagFlag', enabled: false, environment: 'Staging', created_at: now },
      { id: 'd1', name: 'DevFlag', enabled: true, environment: 'Development', created_at: now },
    ];
    api.fetcher.mockResolvedValueOnce(allFlags);

    await act(async () => {
      render(<App />);
    });

    expect(api.fetcher).toHaveBeenCalledTimes(1);
    expect(api.fetcher).toHaveBeenCalledWith('/flags');
    expect(lastFilterProps.selected).toBe(0);
    expect(lastTableProps.flags).toEqual(
      allFlags.filter(f => f.environment === 'Production')
    );
  });

  it('allows sorting (name ↔ created_at and asc ↔ desc)', async () => {
    const now = new Date().toISOString();
    const flags = [
      { id: '1', name: 'Aflag', enabled: true, environment: 'Production', created_at: now },
      { id: '2', name: 'Bflag', enabled: false, environment: 'Production', created_at: now },
    ];
    api.fetcher.mockResolvedValueOnce(flags);

    await act(async () => {
      render(<App />);
    });

    // default
    expect(lastTableProps.sortField).toBe('name');
    expect(lastTableProps.sortDirection).toBe('asc');

    act(() => lastTableProps.onSort('created_at'));
    expect(lastTableProps.sortField).toBe('created_at');
    expect(lastTableProps.sortDirection).toBe('asc');

    act(() => lastTableProps.onSort('created_at'));
    expect(lastTableProps.sortDirection).toBe('desc');
  });

  it('toggles a single flag via onToggle', async () => {
    const now = new Date().toISOString();
    const flags = [{ id: '1', name: 'ToggleMe', enabled: true, environment: 'Production', created_at: now }];

    api.fetcher
      .mockResolvedValueOnce(flags)  // initial load
      .mockResolvedValueOnce({})     // patch
      .mockResolvedValueOnce([]);    // refresh

    await act(async () => {
      render(<App />);
    });
    api.fetcher.mockClear();

    await act(async () => {
      await lastTableProps.onToggle('1', true);
    });

    expect(api.fetcher).toHaveBeenCalledWith(
      '/flags/1',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('deletes a single flag via DeleteConfirm', async () => {
    const now = new Date().toISOString();
    const flags = [{ id: '1', name: 'DeleteMe', enabled: true, environment: 'Production', created_at: now }];

    api.fetcher
      .mockResolvedValueOnce(flags)
      .mockResolvedValueOnce({}) 
      .mockResolvedValueOnce([]);

    await act(async () => {
      render(<App />);
    });
    api.fetcher.mockClear();

    act(() => lastTableProps.onRequestDelete(flags[0]));
    expect(lastDeleteConfirmProps.flagName).toBe('DeleteMe');

    await act(async () => {
      await lastDeleteConfirmProps.onConfirm();
    });
    expect(api.fetcher).toHaveBeenCalledWith(
      '/flags/1',
      { method: 'DELETE' }
    );
  });

  it('deletes a single flag via MobileFlagModal', async () => {
    const now = new Date().toISOString();
    const flags = [
      { id: '1', name: 'KeepMe', enabled: true, environment: 'Production', created_at: now },
      { id: '2', name: 'MobileDel', enabled: false, environment: 'Production', created_at: now },
    ];

    api.fetcher
      .mockResolvedValueOnce(flags)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce([]);

    await act(async () => {
      render(<App />);
    });
    api.fetcher.mockClear();

    act(() => lastTableProps.onOpenRowMenu(flags[1]));
    expect(lastMobileModalProps.flag).toBe(flags[1]);

    await act(async () => {
      await lastMobileModalProps.onDelete('2');
    });
    expect(api.fetcher).toHaveBeenCalledWith(
      '/flags/2',
      { method: 'DELETE' }
    );
  });

  it('performs bulk enable / disable / delete', async () => {
    const now = new Date().toISOString();
    const flags = [
      { id: 'a', name: 'A', enabled: false, environment: 'Production', created_at: now },
      { id: 'b', name: 'B', enabled: true, environment: 'Production', created_at: now },
    ];

    api.fetcher.mockResolvedValue(flags);
    await act(async () => {
      render(<App />);
    });

    act(() => lastTableProps.onSelectAll(true));
    expect(lastTableProps.selectedFlags).toEqual(['a','b']);

    api.fetcher.mockClear();
    await act(async () => {
      await lastTableProps.onBulkEnable();
    });
    expect(api.fetcher).toHaveBeenCalledWith(
      '/flags/bulk-update',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ ids: ['a','b'], enabled: true }),
      })
    );
    expect(lastTableProps.selectedFlags).toEqual([]);

    api.fetcher.mockClear();
    await act(async () => {
      await lastTableProps.onBulkDisable();
    });
    expect(api.fetcher).toHaveBeenCalledWith(
      '/flags/bulk-update',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ ids: [], enabled: false }),
      })
    );
    expect(lastTableProps.selectedFlags).toEqual([]);

    api.fetcher.mockClear();
    await act(async () => {
      await lastTableProps.onBulkDelete();
    });
    expect(api.fetcher).toHaveBeenCalledWith(
      '/flags/bulk-delete',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ ids: [] }),
      })
    );
    expect(lastTableProps.selectedFlags).toEqual([]);
  });
});

describe('App – extra coverage', () => {
  it('filters by search query', async () => {
    const now = new Date().toISOString();
    const flags = [
      { id: '1', name: 'Apple',  enabled: true,  environment: 'Production', created_at: now },
      { id: '2', name: 'Banana', enabled: true,  environment: 'Production', created_at: now },
    ];
    api.fetcher.mockResolvedValueOnce(flags);

    await act(async () => {
      render(<App />);
    });

    fireEvent.change(screen.getByPlaceholderText('Search flags…'), {
      target: { value: 'ban' },
    });

    expect(lastTableProps.flags).toEqual([
      expect.objectContaining({ name: 'Banana' }),
    ]);
  });

  it('switches tabs and filters environment', async () => {
    const now = new Date().toISOString();
    const flags = [
      { id: 'p', name: 'P', enabled: true,  environment: 'Production',  created_at: now },
      { id: 's', name: 'S', enabled: true,  environment: 'Staging',     created_at: now },
      { id: 'd', name: 'D', enabled: true,  environment: 'Development', created_at: now },
    ];
    api.fetcher.mockResolvedValueOnce(flags);

    await act(async () => {
      render(<App />);
    });

    act(() => lastFilterProps.onSelect(2));
    expect(lastTableProps.flags).toEqual([
      expect.objectContaining({ environment: 'Development' }),
    ]);
  });

  it('shows and then hides the Create-Flag form', async () => {
    api.fetcher.mockResolvedValueOnce([]); // initial load
    await act(async () => render(<App />));

    expect(screen.queryByTestId('stub-flag-form')).toBeNull();

    fireEvent.click(screen.getByText('+ Create Flag'));
    expect(screen.getByTestId('stub-flag-form')).toBeInTheDocument();

    act(() => lastFormProps.onClose());
    expect(screen.queryByTestId('stub-flag-form')).toBeNull();
  });

  it('hides form after onCreated callback', async () => {
    api.fetcher
      .mockResolvedValueOnce([])             // initial load
      .mockResolvedValueOnce([{ id: 'x' }]); // onCreated reload

    await act(async () => render(<App />));

    fireEvent.click(screen.getByText('+ Create Flag'));
    expect(screen.getByTestId('stub-flag-form')).toBeInTheDocument();

    await act(async () => lastFormProps.onCreated());
    expect(api.fetcher).toHaveBeenCalledWith('/flags');
    expect(screen.queryByTestId('stub-flag-form')).toBeNull();
  });
});
