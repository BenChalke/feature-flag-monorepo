// src/hooks/__tests__/useSessionValidator.test.jsx
import { renderHook, act } from "@testing-library/react";
import useSessionValidator from "../useSessionValidator";

describe("useSessionValidator hook", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    fetch.mockReset();
  });

  it("calls onExpire immediately when no token is in localStorage", () => {
    const onExpire = jest.fn();
    // use a large interval so no setInterval fires during this test
    renderHook(() => useSessionValidator(onExpire, 60_000));
    // the initial check runs synchronously on mount
    expect(onExpire).toHaveBeenCalled();
  });

  it("calls onExpire and removes token when /auth/me returns ok: false", async () => {
    const onExpire = jest.fn();
    localStorage.setItem("token", "abc123");
    fetch.mockResolvedValue({ ok: false });

    await act(async () => {
      renderHook(() => useSessionValidator(onExpire, 60_000));
      // let the useEffect and validate() promise resolve
      await Promise.resolve();
    });

    expect(onExpire).toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("does NOT call onExpire when /auth/me returns ok: true", async () => {
    const onExpire = jest.fn();
    localStorage.setItem("token", "xyz789");
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, email: "test@example.com" }),
    });

    await act(async () => {
      renderHook(() => useSessionValidator(onExpire, 60_000));
      await Promise.resolve();
    });

    expect(onExpire).not.toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBe("xyz789");
  });
});
