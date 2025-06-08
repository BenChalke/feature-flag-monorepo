// Custom Error subclass for clarity
export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

// A simple fetcher that throws on non-OK responses,
// auto-attaches your JWT, and fires a custom event on 401.
export async function fetcher(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers, credentials: "omit" });

  if (res.status === 401) {
    // clear stored token
    localStorage.removeItem("token");
    // emit so React can show your modal
    window.dispatchEvent(new CustomEvent("session-expired"));
    throw new SessionExpiredError();
  }

  if (!res.ok) {
    const err = new Error("An error occurred while fetching the data.");
    try {
      err.info = await res.json();
    } catch {
      /* ignore JSON parse failures */
    }
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export const API_BASE = import.meta.env.VITE_API_BASE;
export const FLAGS_ENDPOINT = `${API_BASE}/flags`;
