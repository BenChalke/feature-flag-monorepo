// src/api.js
export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

export async function fetcher(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers, credentials: "omit" });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.dispatchEvent(new CustomEvent("session-expired"));
    throw new SessionExpiredError();
  }

  const contentType = (res.headers?.get?.("content-type")) || "";

  if (!res.ok) {
    const err = new Error("An error occurred while fetching the data.");
    if (contentType.includes("application/json")) {
      try { err.info = await res.json(); } catch {
        console.log('');
      }
    }
    err.status = res.status;
    throw err;
  }

  // Prefer JSON if available, else fallback to text
  if (typeof res.json === "function") {
    return res.json();
  } else if (typeof res.text === "function") {
    return res.text();
  }
  return;
}

export const API_BASE = import.meta.env.VITE_API_BASE;
export const FLAGS_ENDPOINT = `${API_BASE}/flags`;
