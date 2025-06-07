// frontend/src/api.js

// A simple fetcher that throws on non-OK responses:
export async function fetcher(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = new Error("An error occurred while fetching the data.");
    try {
      err.info = await res.json();
    } catch {
      console.log('');
    }
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const API_BASE = import.meta.env.VITE_API_BASE;

// Flag endpoint for listing, creating, updating, deleting flags:
export const FLAGS_ENDPOINT = `${API_BASE}/flags`;
