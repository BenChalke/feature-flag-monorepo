// src/__tests__/main.routes.test.jsx
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Main from '../main';

// Stub out the page components so we can assert on a dummy marker
jest.mock('../components/LoginForm',    () => () => <div>LOGIN PAGE</div>);
jest.mock('../components/RegisterForm', () => () => <div>REGISTER PAGE</div>);
jest.mock('../components/NotFound',     () => () => <div>404 PAGE</div>);

// Stub ProtectedLayout to render the nested route outlet
jest.mock('../components/ProtectedLayout', () => {
  const React = require('react');
  const { Outlet } = require('react-router-dom');
  return function ProtectedLayout() {
    return React.createElement(Outlet);
  };
});

// Stub App itself to a simple heading so we can find it
jest.mock('../App', () => {
  const React = require('react');
  return function App() {
    return React.createElement('h1', null, 'App Page');
  };
});

describe('Main routing (src/main.jsx)', () => {
  const renderAt = (path) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Main />
      </MemoryRouter>
    );

  it('renders login at /login', () => {
    renderAt('/login');
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });

  it('renders register at /register', () => {
    renderAt('/register');
    expect(screen.getByText('REGISTER PAGE')).toBeInTheDocument();
  });

  it('falls back to 404 on unknown public route', () => {
    renderAt('/something-else');
    expect(screen.getByText('404 PAGE')).toBeInTheDocument();
  });

  it('allows access to App when token exists', () => {
    localStorage.setItem('token', 'fake-token');
    renderAt('/');
    expect(screen.getByRole('heading', { name: /App Page/i })).toBeInTheDocument();
  });
});
