// src/components/__tests__/LoginForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('LoginForm component', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'abc' })
    });
  });

  test('submits form and navigates on success', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /Log In/ }));
    // …assert on side-effects (e.g. fetch was called)…
  });
});
