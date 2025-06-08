// src/components/NotFound.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../NotFound';
import { MemoryRouter } from 'react-router-dom';

test('renders 404 message and link', () => {
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  );
  expect(screen.getByText(/404/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Go Home/ })).toBeInTheDocument();
});
