// src/components/__tests__/FlagTable.test.jsx
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  within,
} from '@testing-library/react';
import FlagTable from '../FlagTable';

// ----------------------------------------------------------------------
// 1) Stub FlagRow as a <tr> so we don't break <tbody> nesting
// ----------------------------------------------------------------------
jest.mock('../FlagRow', () => (props) => (
  <tr data-testid="flag-row">
    <td>{props.flag.id}</td>
    <td data-testid="selected">{String(props.selected)}</td>
  </tr>
));

// ----------------------------------------------------------------------
// 2) Stub ConfirmModal so we can capture props in lastConfirmProps
// ----------------------------------------------------------------------
let lastConfirmProps = null;
jest.mock('../ConfirmModal', () => (props) => {
  lastConfirmProps = props;
  return (
    <div data-testid="confirm-modal">
      <h1>{props.title}</h1>
      <div data-testid="confirm-body">{props.children}</div>
    </div>
  );
});

describe('FlagTable component', () => {
  const now = new Date().toISOString();
  const sampleFlags = [
    { id: 'a', name: 'A', enabled: false, environment: 'P', created_at: now },
    { id: 'b', name: 'B', enabled: true,  environment: 'P', created_at: now },
  ];

  function setup(overrides = {}) {
    const defaults = {
      flags: [],
      loading: false,
      error: null,
      onToggle: jest.fn(),
      onRequestDelete: jest.fn(),
      onOpenRowMenu: jest.fn(),
      sortField: 'name',
      sortDirection: 'asc',
      onSort: jest.fn(),
      selectedFlags: [],
      onSelectFlag: jest.fn(),
      onSelectAll: jest.fn(),
      onBulkEnable: jest.fn(),
      onBulkDisable: jest.fn(),
      onBulkDelete: jest.fn(),
    };
    const props = { ...defaults, ...overrides };
    render(<FlagTable {...props} />);
    return props;
  }

  it('shows a spinner when loading', () => {
    setup({ loading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows "no flags" when not loading and no flags', () => {
    setup();
    expect(
      screen.getByText(/No flags in this environment\./i)
    ).toBeInTheDocument();
  });

  it('shows an error message when error is set', () => {
    setup({ error: new Error('fail') });
    expect(screen.getByText(/Failed to load flags\./i)).toBeInTheDocument();
  });

  it('renders one FlagRow per flag and passes selection state', () => {
    setup({ flags: sampleFlags, selectedFlags: ['b'] });
    const rows = screen.getAllByTestId('flag-row');
    expect(rows).toHaveLength(2);

    expect(within(rows[0]).getByText('a')).toBeInTheDocument();
    expect(within(rows[0]).getByTestId('selected')).toHaveTextContent('false');

    expect(within(rows[1]).getByText('b')).toBeInTheDocument();
    expect(within(rows[1]).getByTestId('selected')).toHaveTextContent('true');
  });

  it('calls onSort when you click the Name and Created At headers', () => {
    const { onSort } = setup({ flags: sampleFlags });
    fireEvent.click(screen.getByText('Name'));
    expect(onSort).toHaveBeenCalledWith('name');

    fireEvent.click(screen.getByText('Created At'));
    expect(onSort).toHaveBeenCalledWith('created_at');
  });

  it('toggles "select all" when header checkbox clicked', () => {
    const { onSelectAll } = setup({ flags: sampleFlags });
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    expect(headerCheckbox).not.toBeChecked();

    // clicking it should call onSelectAll with the new checked value (true)
    fireEvent.click(headerCheckbox);
    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  describe('bulk actions dropdown + confirm modal', () => {
    let props;
    beforeEach(() => {
      lastConfirmProps = null;
      props = setup({
        flags: sampleFlags,
        selectedFlags: ['a', 'b'], // bulkCount = 2
      });
    });

    it('opens dropdown and shows Enable/Disable/Delete', () => {
      const bulkBtn = screen.getByRole('button', { name: /Bulk actions/i });
      fireEvent.click(bulkBtn);
      expect(screen.getByText('Enable')).toBeInTheDocument();
      expect(screen.getByText('Disable')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('opens confirm modal and calls onBulkEnable on confirm', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Bulk actions/i }));
      fireEvent.click(screen.getByText('Enable'));

      expect(lastConfirmProps.title).toBe('Enable 2 flags?');
      expect(
        within(screen.getByTestId('confirm-modal')).getByText(
          /turn ON all 2 selected flags\?/i
        )
      ).toBeInTheDocument();

      await act(async () => {
        await lastConfirmProps.onConfirm();
      });
      expect(props.onBulkEnable).toHaveBeenCalled();
    });

    it('opens confirm modal and calls onBulkDisable on confirm', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Bulk actions/i }));
      fireEvent.click(screen.getByText('Disable'));

      expect(lastConfirmProps.title).toBe('Disable 2 flags?');
      await act(async () => {
        await lastConfirmProps.onConfirm();
      });
      expect(props.onBulkDisable).toHaveBeenCalled();
    });

    it('opens confirm modal and calls onBulkDelete on confirm', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Bulk actions/i }));
      fireEvent.click(screen.getByText('Delete'));

      expect(lastConfirmProps.title).toBe('Delete 2 flags?');
      await act(async () => {
        await lastConfirmProps.onConfirm();
      });
      expect(props.onBulkDelete).toHaveBeenCalled();
    });
  });
});
