// frontend/src/api.js

// A simple fetcher that throws on non-OK responses and auto-attaches your JWT.
export async function fetcher(url, options = {}) {
  // Grab token from storage
  const token = localStorage.getItem("token");

  // Merge headers, always JSON
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = new Error("An error occurred while fetching the data.");
    try {
      err.info = await res.json();
    } catch {
      /* ignore */
    }
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Base URL pulled from your VITE env var
export const API_BASE = import.meta.env.VITE_API_BASE;
export const FLAGS_ENDPOINT = `${API_BASE}/flags`;
