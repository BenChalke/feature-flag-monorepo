// frontend/src/api.js

// A simple fetcher that throws on non-OK responses:
export async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error("An error occurred while fetching the data.");
    err.info = await res.json();
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const API_BASE = import.meta.env.VITE_API_BASE;

// Flag endpoint for listing, creating, and updating flags:
export const FLAGS_ENDPOINT = `${API_BASE}/flags`;
