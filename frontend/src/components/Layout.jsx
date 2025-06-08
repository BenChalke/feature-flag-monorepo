import React from "react";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {children}
    </div>
  );
}