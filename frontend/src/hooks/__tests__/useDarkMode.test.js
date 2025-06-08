// src/hooks/__tests__/useDarkMode.system.test.js
import { renderHook, act } from '@testing-library/react';
import useDarkMode from '../useDarkMode';

describe('useDarkMode – system preference & listener', () => {
  let originalMatchMedia;
  let mql;

  beforeEach(() => {
    // clear any saved theme
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.dataset.theme = '';

    // stub window.matchMedia
    originalMatchMedia = window.matchMedia;
    mql = {
      matches: false,
      addEventListener: jest.fn((evt, fn) => {
        mql._handler = fn;
      }),
      removeEventListener: jest.fn(),
    };
    window.matchMedia = jest.fn().mockReturnValue(mql);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('falls back to system dark when no stored setting', () => {
    mql.matches = true; // system says dark
    const { result } = renderHook(() => useDarkMode());
    expect(result.current[0]).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('does NOT update when system preference changes after initial persistence', () => {
    mql.matches = false;
    const { result } = renderHook(() => useDarkMode());
    // initial theme persisted to localStorage = 'light'
    act(() => mql._handler({ matches: true }));
    // because a stored value exists, we don’t override
    expect(result.current[0]).toBe('light');
  });

  it('updates when system preference changes if you clear the stored override', () => {
    mql.matches = false;
    const { result } = renderHook(() => useDarkMode());
    // simulate user (or external) removing the override
    act(() => {
      localStorage.removeItem('theme');
      mql._handler({ matches: true });
    });
    expect(result.current[0]).toBe('dark');
  });

  it('cleans up the change listener on unmount', () => {
    const { unmount } = renderHook(() => useDarkMode());
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });
});
