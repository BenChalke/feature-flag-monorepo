// src/contexts/AuthContext.test.jsx
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as api from '../../api';

jest.mock('../../api');

describe('AuthContext', () => {
  let result;

  function Consumer() {
    result = useAuth();
    return null;
  }

  beforeEach(() => {
    result = undefined;
    document.cookie = '';
    api.fetcher.mockReset();
  });

  it('provides user after fetching on mount', async () => {
    const fakeUser = { email: 'a@b.com' };
    api.fetcher.mockResolvedValueOnce(fakeUser);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(result.user).toEqual(fakeUser);
    });
  });

  it('sets user to null if initial fetch fails', async () => {
    api.fetcher.mockRejectedValueOnce(new Error('not logged in'));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(result.user).toBeNull();
    });
  });

  it('login() calls the login endpoint then /auth/me and updates user', async () => {
    // 1st call (mount effect): we can stub it but we don't care about this value
    api.fetcher.mockResolvedValueOnce({ email: 'foo@bar.com' });
    // Next two calls: login POST, then fetch /auth/me
    api.fetcher
      .mockResolvedValueOnce({})                         // login POST
      .mockResolvedValueOnce({ email: 'c@d.com' });      // me after login

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // wait for the mount‐effect to run
    await waitFor(() => result.user !== undefined);

    // perform login
    await act(async () => {
      await result.login('c@d.com', 'password123');
    });

    // find the POST /auth/login call
    const loginCall = api.fetcher.mock.calls.find(
      ([url]) => url.endsWith('/auth/login')
    );
    expect(loginCall).toBeDefined();
    expect(loginCall[1]).toEqual(
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'c@d.com', password: 'password123' }),
      })
    );

    // find the GET /auth/me call after login
    const meCall = api.fetcher.mock.calls.find(
      ([url], idx) => url.endsWith('/auth/me') && idx > api.fetcher.mock.calls.indexOf(loginCall)
    );
    expect(meCall).toBeDefined();

    // user state should now be the second me response
    expect(result.user).toEqual({ email: 'c@d.com' });
  });

  it('logout() clears the user and the cookie', async () => {
    const fakeUser = { email: 'x@y.com' };
    api.fetcher.mockResolvedValueOnce(fakeUser);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(result.user).toEqual(fakeUser);
    });

    act(() => {
      result.logout();
    });

    expect(result.user).toBeNull();
    // JSDOM will immediately clear a Max-Age=0 cookie, so document.cookie === ""
    expect(document.cookie).toBe('');
  });
});
