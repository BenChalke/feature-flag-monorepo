import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Registration failed");
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
        <h2 className="text-2xl font-medium mb-4 text-gray-900 dark:text-gray-100">
          Registration Successful!
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Your account has been created. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-medium mb-4 text-gray-900 dark:text-gray-100">
        Register
      </h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {/* noValidate disables native required-field checks so your validate() runs */}
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="First Name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Last Name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        {/* Password field with its own relative wrapper */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              aria-label="Toggle password visibility"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Confirm password field similarly wrapped */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <div className="relative mt-1">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(s => !s)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              aria-label="Toggle confirm password visibility"
            >
              <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={
            `w-full py-2 h-10 relative flex items-center justify-center rounded text-white transition-colors ` +
            (loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700")
          }
        >
          {loading && (
            <div className="absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span className={loading ? "opacity-0" : ""}>Register</span>
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
