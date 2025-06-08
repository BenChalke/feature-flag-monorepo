import React, { createContext, useState, useEffect, useContext } from "react";
import { fetcher, API_BASE } from "../api";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { email, firstName, lastName }

  // check session on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await fetcher(`${API_BASE}/auth/me`, {
          credentials: "include",
        });
        setUser(me);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const login = async (email, password) => {
    // call login, which should set a cookie or return a token as appropriate
    await fetcher(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    // fetch the user
    const me = await fetcher(`${API_BASE}/auth/me`, {
      credentials: "include",
    });
    setUser(me);
  };

  const logout = async () => {
    // if you have a /auth/logout endpoint, call it here
    // otherwise just clear client‐side state / cookies
    document.cookie = "token=; Max-Age=0; path=/";
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
