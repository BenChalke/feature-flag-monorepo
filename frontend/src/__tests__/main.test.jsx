// src/__tests__/main.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Main from '../main';

describe('Main routing', () => {
  it('renders login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Main />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders register route', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Main />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
  });

  it('renders 404 on unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/somewhere']}> 
        <Main />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /404/ })).toBeInTheDocument();
    expect(screen.getByText(/doesn.?t exist/i)).toBeInTheDocument();
  });
});