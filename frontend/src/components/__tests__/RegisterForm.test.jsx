// src/components/__tests__/RegisterForm.test.jsx
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import RegisterForm from '../RegisterForm';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockNavigate,
    Link: original.Link,
  };
});

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('RegisterForm component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    // default fetch always succeeds
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  const fillAndSubmit = async (fields) => {
    // fill each field if present in the fields object
    for (const [placeholder, value] of Object.entries(fields)) {
      const input = screen.getByPlaceholderText(placeholder);
      fireEvent.change(input, { target: { value } });
    }
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
  };

  test('shows error when first or last name missing', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    expect(
      screen.getByText(/First and last name are required\./i)
    ).toBeInTheDocument();
  });

  test('shows error on invalid email', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
    fillAndSubmit({
      'First Name': 'Jane',
      'Last Name': 'Doe',
      'you@example.com': 'not-an-email',
    });
    expect(
      screen.getByText(/Please enter a valid email address\./i)
    ).toBeInTheDocument();
  });

  test('shows error when password too short', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
    fillAndSubmit({
      'First Name': 'Jane',
      'Last Name': 'Doe',
      'you@example.com': 'jane@example.com',
      Password: '123',
      'Confirm Password': '123',
    });
    expect(
      screen.getByText(/Password must be at least 6 characters\./i)
    ).toBeInTheDocument();
  });

  test('shows error when passwords do not match', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
    fillAndSubmit({
      'First Name': 'Jane',
      'Last Name': 'Doe',
      'you@example.com': 'jane@example.com',
      Password: 'abcdef',
      'Confirm Password': 'ghijkl',
    });
    expect(
      screen.getByText(/Passwords do not match\./i)
    ).toBeInTheDocument();
  });

  test('on success, shows success message and redirects after 3s', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    await fillAndSubmit({
      'First Name': 'Jane',
      'Last Name': 'Doe',
      'you@example.com': 'jane@example.com',
      Password: 'abcdef',
      'Confirm Password': 'abcdef',
    });

    // success state should render a different message
    expect(
      await screen.findByText(/Registration Successful!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Redirecting to login\.\.\./i)
    ).toBeInTheDocument();

    // fast‐forward timer
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        replace: true,
      });
    });
  });

  test('toggles password visibility inputs', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    const pwdInput = screen.getByPlaceholderText('Password');
    const confirmInput = screen.getByPlaceholderText('Confirm Password');
    const [togglePwdBtn, toggleConfirmBtn] = screen.getAllByRole(
      'button',
      { name: /toggle .* visibility/i }
    );

    // default is password type
    expect(pwdInput).toHaveAttribute('type', 'password');
    fireEvent.click(togglePwdBtn);
    expect(pwdInput).toHaveAttribute('type', 'text');
    fireEvent.click(togglePwdBtn);
    expect(pwdInput).toHaveAttribute('type', 'password');

    // confirm field
    expect(confirmInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleConfirmBtn);
    expect(confirmInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleConfirmBtn);
    expect(confirmInput).toHaveAttribute('type', 'password');
  });
});
