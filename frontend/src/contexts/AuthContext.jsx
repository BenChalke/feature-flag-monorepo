// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // {email, firstName, lastName}

  // check session on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/auth/me`, {
      credentials: "include",
    }).then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.email) setUser(data); });
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    // fetch /auth/me
    const me = await fetch(`${import.meta.env.VITE_API_BASE}/auth/me`, {
      credentials: "include",
    }).then(r => r.json());
    setUser(me);
  };

  const logout = async () => {
    // clear cookie via endpoint or client-side
    document.cookie = "session=; Max-Age=0; path=/";
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
