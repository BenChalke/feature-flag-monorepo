// src/components/SessionExpiredModal.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionExpiredModal from '../SessionExpiredModal';

test('renders and calls onClose', () => {
  const onClose = jest.fn();
  render(<SessionExpiredModal onClose={onClose} />);
  expect(screen.getByText(/Session Expired/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /OK/ }));
  expect(onClose).toHaveBeenCalled();
});