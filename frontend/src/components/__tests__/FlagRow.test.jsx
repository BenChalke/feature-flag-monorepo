// src/components/FlagRow.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlagRow from '../FlagRow';

describe('FlagRow', () => {
  const flag = {
    id: '1',
    name: 'TestFlag',
    enabled: false,
    created_at: new Date('2025-06-09T12:00:00Z').toISOString(),
  };
  let onToggle;
  let onRequestDelete;
  let onOpenMenu;
  let onSelect;

  const renderRow = (props = {}) =>
    render(
      <table>
        <tbody>
          <FlagRow
            flag={flag}
            onToggle={onToggle}
            onRequestDelete={onRequestDelete}
            onOpenMenu={onOpenMenu}
            selected={false}
            onSelect={onSelect}
            {...props}
          />
        </tbody>
      </table>
    );

  beforeEach(() => {
    onToggle = jest.fn().mockResolvedValue();
    onRequestDelete = jest.fn();
    onOpenMenu = jest.fn();
    onSelect = jest.fn();
  });

  test('renders the flag name and created date', () => {
    renderRow();
    expect(screen.getByText('TestFlag')).toBeInTheDocument();
    expect(
      screen.getByText('Jun 09, 2025', { exact: false })
    ).toBeInTheDocument();
  });

  test('calls onSelect when the row checkbox is clicked', () => {
    renderRow();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test('calls onToggle with the right args when switch is clicked', async () => {
    renderRow();
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledWith('1', false);
  });

  test('shows a spinner while toggling', () => {
    // Make onToggle return a promise that never resolves
    onToggle = jest.fn(() => new Promise(() => {}));
    renderRow({ onToggle });

    // click to start toggling
    fireEvent.click(screen.getByRole('switch'));

    // the spinner has the animate-spin class
    const spinner = screen.getByRole('row').querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('calls onRequestDelete when delete button is clicked', () => {
    renderRow();
    const deleteButton = screen.getByLabelText('Delete TestFlag');
    fireEvent.click(deleteButton);
    expect(onRequestDelete).toHaveBeenCalledWith(flag);
  });

  test('calls onOpenMenu when more button is clicked', () => {
    renderRow();
    const moreButton = screen.getByLabelText('More actions for TestFlag');
    fireEvent.click(moreButton);
    expect(onOpenMenu).toHaveBeenCalledWith(flag);
  });
});
