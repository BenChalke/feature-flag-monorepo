import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

test('renders copyright text', () => {
  render(<Footer />);
  expect(screen.getByText(/© 2025 Ben Chalke/)).toBeInTheDocument();
});
