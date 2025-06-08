// src/__tests__/api.test.jsx
import { fetcher, FLAGS_ENDPOINT, API_BASE, SessionExpiredError } from '../api';

describe('api.fetcher', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('resolves with JSON on ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ foo: 'bar' }),
    });

    await expect(fetcher(FLAGS_ENDPOINT)).resolves.toEqual({ foo: 'bar' });
    expect(global.fetch).toHaveBeenCalledWith(
      FLAGS_ENDPOINT,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
      })
    );
  });

  it('rejects on non-ok (500) response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'oops' }),
    });

    await expect(fetcher('/foo')).rejects.toThrow(
      'An error occurred while fetching the data.'
    );
  });

  it('rejects on network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('no network'));
    await expect(fetcher('/foo')).rejects.toThrow('no network');
  });

  it('dispatches session-expired and throws SessionExpiredError on 401', async () => {
    // seed a token so fetcher will try to attach it
    localStorage.setItem('token', 'abc123');

    // spy on window.dispatchEvent
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'auth failed' }),
    });

    await expect(fetcher('/auth')).rejects.toBeInstanceOf(SessionExpiredError);

    // token should be removed
    expect(localStorage.getItem('token')).toBeNull();

    // should have dispatched a 'session-expired' custom event
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'session-expired' })
    );
  });

  it('exports FLAGS_ENDPOINT as a string ending in /flags', () => {
    expect(typeof FLAGS_ENDPOINT).toBe('string');
    expect(FLAGS_ENDPOINT).toMatch(/\/flags$/);
  });
});
