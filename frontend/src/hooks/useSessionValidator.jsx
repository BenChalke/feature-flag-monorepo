import { useEffect } from "react";

export default function useSessionValidator(onExpire, intervalMs = 2 * 60 * 1000) {
  async function validate() {
    const token = localStorage.getItem("token");
    if (!token) {
      onExpire();
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Invalid session");
    }
    return res.json();
  }

  useEffect(() => {
    const check = () => {
      validate().catch(() => {
        localStorage.removeItem("token");
        onExpire();
      });
    };

    check();
    const tid = setInterval(check, intervalMs);
    return () => clearInterval(tid);
  }, [intervalMs, onExpire]);
}
