// src/components/__tests__/Layout.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

test('renders children inside layout container', () => {
  render(
    <Layout>
      <p>Child content</p>
    </Layout>
  );
  // The child should appear
  expect(screen.getByText('Child content')).toBeInTheDocument();

  // The container should have the layout CSS classes
  const container = screen.getByText('Child content').parentElement;
  expect(container).toHaveClass('flex', 'flex-col', 'min-h-screen', 'bg-gray-50', 'dark:bg-gray-900', 'transition-colors');
});
