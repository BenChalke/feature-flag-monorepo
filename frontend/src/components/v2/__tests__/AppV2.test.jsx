// src/components/v2/__tests__/AppV2.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AppV2 from '../AppV2';

// ————————————————————————————————————————————————————————————————————
// Mocks
// ————————————————————————————————————————————————————————————————————

jest.mock('../../../api', () => ({
  fetcher: jest.fn(),
  SessionExpiredError: class extends Error {},
  FLAGS_ENDPOINT: '/flags',
}));

jest.mock('../../../hooks/useAwsWebSocketFlags', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Stub out all child components to simplify
jest.mock('../LayoutV2', () => (props) => (
  <div>
    <button onClick={() => props.onAddFlagClick('Staging')}>
      +Add
    </button>
    {props.children}
  </div>
));
jest.mock('../FeatureListV2', () => (props) => (
  <div data-testid="feature-list">
    {props.flags.map(f => (
      <div key={f.id} data-testid="flag-item">{f.name}</div>
    ))}
    <button onClick={() => props.onToggle(1, true)}>
      toggle-1
    </button>
    <button onClick={() => props.onEdit({ id: 1, name: 'A' })}>
      edit-1
    </button>
  </div>
));
jest.mock('../EditFlagModalV2', () => (props) => (
  props.isOpen ? (
    <div data-testid="edit-modal">
      <button onClick={props.onClose}>close-edit</button>
      <button onClick={() => props.onSave({ id: 1, name: 'X' })}>save-edit</button>
      <button onClick={() => props.onRequestDelete(1, 'X')}>delete-edit</button>
    </div>
  ) : null
));
jest.mock('../CreateFlagModalV2', () => (props) => (
  props.isOpen ? (
    <div data-testid="create-modal">
      <button onClick={props.onClose}>close-create</button>
      <button onClick={() => props.onCreate({ name: 'New' })}>create-flag</button>
    </div>
  ) : null
));
jest.mock('../DeleteConfirmV2', () => (props) => (
  props.flagName ? (
    <div data-testid="delete-confirm">
      <button onClick={props.onCancel}>cancel-delete</button>
      <button onClick={props.onConfirm}>confirm-delete</button>
    </div>
  ) : null
));

// ————————————————————————————————————————————————————————————————————
// Tests
// ————————————————————————————————————————————————————————————————————

import { fetcher } from '../../../api';
import useAwsWebSocketFlags from '../../../hooks/useAwsWebSocketFlags';

describe('AppV2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // make WS hook do nothing
    useAwsWebSocketFlags.mockImplementation(() => {});
  });

  it('shows loading while fetching', async () => {
    fetcher.mockReturnValue(new Promise(() => {})); // never resolves
    render(<AppV2 />);
    expect(screen.getByText(/Loading flags…/i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    fetcher.mockRejectedValueOnce(new Error('oops'));
    render(<AppV2 />);
    // error branch renders inside LayoutV2
    await waitFor(() => {
      expect(screen.getByText(/oops/)).toBeInTheDocument();
    });
  });

  it('renders empty list when no flags', async () => {
    fetcher.mockResolvedValueOnce([]);
    render(<AppV2 />);
    await waitFor(() => {
      // FeatureListV2 rendered with zero entries
      expect(screen.getByTestId('feature-list')).toBeInTheDocument();
      expect(screen.queryAllByTestId('flag-item')).toHaveLength(0);
    });
  });

  it('renders flags and responds to toggle & edit', async () => {
    // return two fake flags
    fetcher.mockResolvedValueOnce([
      { id: 1, name: 'First', enabled: true, environment: 'Development' },
      { id: 2, name: 'Second', enabled: false, environment: 'Development' },
    ]);
    render(<AppV2 />);
    await waitFor(() => {
      // two items appear
      const items = screen.getAllByTestId('flag-item');
      expect(items.map(el => el.textContent)).toEqual(['First','Second']);
    });
    // toggle
    fetcher.mockResolvedValueOnce({});
    fireEvent.click(screen.getByText('toggle-1'));
    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith('/flags/1', expect.objectContaining({
        method: 'PATCH'
      }));
    });
    // edit
    fireEvent.click(screen.getByText('edit-1'));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('opens and closes create modal', async () => {
    fetcher.mockResolvedValueOnce([]);
    render(<AppV2 />);
    await waitFor(() => {});
    fireEvent.click(screen.getByText('+Add'));
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('close-create'));
    expect(screen.queryByTestId('create-modal')).toBeNull();
  });

  it('handles save in edit modal showing spinner prop', async () => {
    fetcher.mockResolvedValueOnce([]); // initial load
    render(<AppV2 />);
    await waitFor(() => {});
    // open edit
    fireEvent.click(screen.getByText('edit-1'));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
    // click save
    fetcher.mockResolvedValueOnce({});
    fireEvent.click(screen.getByText('save-edit'));
    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith('/flags/1', expect.objectContaining({
        method: 'PUT'
      }));
    });
  });

  it('flows through delete confirm', async () => {
    fetcher.mockResolvedValueOnce([]); // initial load
    render(<AppV2 />);
    await waitFor(() => {});
    // trigger delete from edit modal
    fireEvent.click(screen.getByText('edit-1'));
    fireEvent.click(screen.getByText('delete-edit'));
    expect(screen.getByTestId('delete-confirm')).toBeInTheDocument();
    // cancel
    fireEvent.click(screen.getByText('cancel-delete'));
    expect(screen.queryByTestId('delete-confirm')).toBeNull();
    // re-open and confirm
    fireEvent.click(screen.getByText('delete-edit'));
    fetcher.mockResolvedValueOnce({});
    fireEvent.click(screen.getByText('confirm-delete'));
    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith('/flags/1', { method: 'DELETE' });
    });
  });
});
