// src/components/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Login failed");
      }

      const { token } = body;
      if (!token) {
        throw new Error("Server didn’t return a token");
      }

      localStorage.setItem("token", token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-medium mb-4 text-gray-900 dark:text-gray-100">
        Log In
      </h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full h-10 relative flex items-center justify-center rounded text-white transition-colors
            ${loading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {/* spinner */}
          {loading && (
            <div className="absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {/* invisible text keeps button size constant */}
          <span className={loading ? "opacity-0" : ""}>Log In</span>
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
