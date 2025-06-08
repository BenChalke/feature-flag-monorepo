// src/components/__tests__/MobileFlagModal.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MobileFlagModal from '../MobileFlagModal';

// A sample flag object
const flag = {
  id: '1',
  name: 'Test Flag',
  created_at: '2025-01-01T00:00:00.000Z',
};

describe('MobileFlagModal', () => {
  it('renders nothing when no flag is provided', () => {
    const { container } = render(
      <MobileFlagModal flag={null} onClose={() => {}} onDelete={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders flag details, close and delete buttons', () => {
    render(
      <MobileFlagModal flag={flag} onClose={() => {}} onDelete={() => {}} />
    );

    // Title shows the flag name
    expect(screen.getByText('Test Flag')).toBeInTheDocument();

    // Created date label and formatted date
    expect(screen.getByText('Created:')).toBeInTheDocument();
    expect(screen.getByText('Jan 01, 2025')).toBeInTheDocument();

    // Close button (aria-label="Close")
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();

    // Delete Flag button
    expect(
      screen.getByRole('button', { name: /Delete Flag/i })
    ).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <MobileFlagModal flag={flag} onClose={onClose} onDelete={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('opens the confirmation dialog when Delete Flag is clicked', () => {
    render(
      <MobileFlagModal flag={flag} onClose={() => {}} onDelete={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Delete Flag/i }));

    // ConfirmModal header and body text
    expect(
      screen.getByText('Delete Feature Flag')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete the flag/)
    ).toBeInTheDocument();

    // Cancel and Delete buttons inside confirm
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onDelete and onClose when confirming deletion', async () => {
    const onClose = jest.fn();
    const onDelete = jest.fn().mockResolvedValue();

    render(
      <MobileFlagModal flag={flag} onClose={onClose} onDelete={onDelete} />
    );

    // Open confirm dialog
    fireEvent.click(screen.getByRole('button', { name: /Delete Flag/i }));

    // Click the "Delete" button inside ConfirmModal
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }));

    // onDelete should be called with the flag id
    expect(onDelete).toHaveBeenCalledWith('1');

    // Wait for the promise to resolve, then expect onClose
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
