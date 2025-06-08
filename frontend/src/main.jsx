// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./index.css";

import Layout from "./components/Layout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedLayout from "./components/ProtectedLayout";

import App from "./App";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import NotFound from "./components/NotFound";

// Wraps *all* pages in your shared chrome
function PublicLayout() {
  return (
    <Layout>
      <Header />
      <main className="flex-1 p-2 sm:p-6">
        <Outlet />
      </main>
      <Footer />
    </Layout>
  );
}
// Redirect to /login if no token
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function Main() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Everything sits under the same public chrome */}
        <Route element={<PublicLayout />}>
          {/* Public */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/404" element={<NotFound />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <ProtectedLayout />
              </RequireAuth>
            }
          >
            <Route index element={<App />} />
            {/* add more protected child routes here */}
            <Route path="/404" element={<NotFound />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>
  );
}
