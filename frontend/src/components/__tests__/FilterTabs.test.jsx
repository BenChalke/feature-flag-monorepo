// src/components/__tests__/FilterTabs.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterTabs from '../FilterTabs';

describe('FilterTabs', () => {
  const tabs = ['Production', 'Staging', 'Development'];

  it('renders all three tabs', () => {
    render(<FilterTabs selected={1} onSelect={() => {}} />);
    tabs.forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('applies active styles to the selected tab', () => {
    render(<FilterTabs selected={2} onSelect={() => {}} />);
    const active = screen.getByRole('button', { name: 'Development' });
    // Should have border-blue-600 when active
    expect(active).toHaveClass('border-blue-600');
  });

  it('invokes onSelect with correct index on click', () => {
    const onSelect = jest.fn();
    render(<FilterTabs selected={0} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Staging' }));
    expect(onSelect).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: 'Development' }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
