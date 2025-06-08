import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        404
      </h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
