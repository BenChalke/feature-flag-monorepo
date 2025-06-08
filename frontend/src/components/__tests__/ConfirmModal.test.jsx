// src/components/__tests__/ConfirmModal.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  const title = 'Are you sure?';
  const bodyText = 'This will do a thing.';
  const cancelText = 'Nope';
  const confirmText = 'Yep';
  const children = <p>{bodyText}</p>;
  let onCancel, onConfirm;

  beforeEach(() => {
    onCancel = jest.fn();
    onConfirm = jest.fn();
  });

  test('renders title, body, and buttons', () => {
    render(
      <ConfirmModal
        title={title}
        cancelText={cancelText}
        confirmText={confirmText}
        onCancel={onCancel}
        onConfirm={onConfirm}
      >
        {children}
      </ConfirmModal>
    );
    // title
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    // body
    expect(screen.getByText(bodyText)).toBeInTheDocument();
    // buttons
    expect(screen.getByRole('button', { name: cancelText })).toBeEnabled();
    expect(screen.getByRole('button', { name: confirmText })).toBeEnabled();
  });

  test('calls onCancel when Cancel is clicked', () => {
    render(
      <ConfirmModal
        title={title}
        cancelText={cancelText}
        confirmText={confirmText}
        onCancel={onCancel}
        onConfirm={onConfirm}
      >
        {children}
      </ConfirmModal>
    );
    fireEvent.click(screen.getByRole('button', { name: cancelText }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onConfirm when Confirm is clicked', () => {
    render(
      <ConfirmModal
        title={title}
        cancelText={cancelText}
        confirmText={confirmText}
        onCancel={onCancel}
        onConfirm={onConfirm}
      >
        {children}
      </ConfirmModal>
    );
    fireEvent.click(screen.getByRole('button', { name: confirmText }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('when loading, confirm button is disabled and shows spinner', () => {
    render(
      <ConfirmModal
        title={title}
        cancelText={cancelText}
        confirmText={confirmText}
        onCancel={onCancel}
        onConfirm={onConfirm}
        loading={true}
      >
        {children}
      </ConfirmModal>
    );
    const confirmBtn = screen.getByRole('button', { name: confirmText });
    expect(confirmBtn).toBeDisabled();
    // spinner is the child div with animate-spin
    expect(confirmBtn.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
