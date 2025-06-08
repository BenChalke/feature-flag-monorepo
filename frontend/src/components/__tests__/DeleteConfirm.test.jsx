// src/components/__tests__/DeleteConfirm.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirm from '../DeleteConfirm';

describe('DeleteConfirm', () => {
  const flagName = 'MyFlag';
  let onCancel, onConfirm;

  beforeEach(() => {
    onCancel = jest.fn();
    onConfirm = jest.fn();
  });

  test('renders the delete title and flag name', () => {
    render(
      <DeleteConfirm
        flagName={flagName}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    // Title
    expect(screen.getByRole('heading', { name: /delete feature flag/i }))
      .toBeInTheDocument();

    // Body contains flagName
    expect(
      screen.getByText(new RegExp(flagName, 'i'))
    ).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /delete/i })).toBeEnabled();
  });

  test('calls onCancel when cancel clicked', () => {
    render(
      <DeleteConfirm
        flagName={flagName}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onConfirm when delete clicked', () => {
    render(
      <DeleteConfirm
        flagName={flagName}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
