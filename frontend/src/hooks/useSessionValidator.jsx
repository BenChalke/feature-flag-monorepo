// src/hooks/useSessionValidator.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useSessionValidator(intervalMs = 2 * 60 * 1000) {
  const navigate = useNavigate();

  async function validate() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token");

    const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
      // if you switch to cookies later, add credentials: 'include' here
    });

    if (!res.ok) {
      throw new Error("Invalid session");
    }
    return res.json();
  }

  useEffect(() => {
    const tid = setInterval(() => {
      validate().catch(() => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      });
    }, intervalMs);

    // once on mount
    validate().catch(() => {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    });

    return () => clearInterval(tid);
  }, [intervalMs, navigate]);
}
