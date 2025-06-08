// src/components/__tests__/Header.test.jsx
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import Header from '../Header';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

// 1) Mock useNavigate
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

// 2) Stub matchMedia so theme defaults consistently
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
    })),
  });
});

describe('Header component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // reset classes
    document.documentElement.classList.remove('dark', 'light');
  });

  test('renders app title', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /Feature Flag Manager/i })
    ).toBeInTheDocument();
  });

  test('toggles theme and writes to localStorage', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // open the cog menu by clicking the <summary>
    const details = screen.getByRole('group');
    const summary = details.querySelector('summary');
    fireEvent.click(summary);

    // click the Toggle Theme menu item
    fireEvent.click(
      screen.getByRole('button', { name: /Toggle Theme/i })
    );

    // should have added "dark"
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    // toggle back
    fireEvent.click(summary);
    fireEvent.click(
      screen.getByRole('button', { name: /Toggle Theme/i })
    );

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('does not show "Log Out" when no token in localStorage', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const details = screen.getByRole('group');
    const summary = details.querySelector('summary');
    fireEvent.click(summary);

    expect(screen.queryByRole('button', { name: /^Log Out$/i })).toBeNull();
  });

  test('shows "Log Out" when token exists and handles logout flow', async () => {
    localStorage.setItem('token', 'fake-token');

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // open the cog menu
    const details = screen.getByRole('group');
    const summary = details.querySelector('summary');
    fireEvent.click(summary);

    // click the menu Log Out
    fireEvent.click(
      screen.getByRole('button', { name: /^Log Out$/i })
    );

    // confirm modal is up
    expect(
      screen.getByText(/Are you sure you want to log out\?/i)
    ).toBeInTheDocument();

    // pick the last "Log Out" button (the modal one)
    const logoutButtons = screen.getAllByRole('button', {
      name: /^Log Out$/i,
    });
    const modalLogoutBtn = logoutButtons[logoutButtons.length - 1];
    fireEvent.click(modalLogoutBtn);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        replace: true,
      });
    });
  });
});
