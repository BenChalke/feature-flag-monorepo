// frontend/src/main.jsx
import React, { useState, useEffect } from "react";
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

import AppV1 from "./App";
import AppV2 from "./components/v2/AppV2";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import NotFound from "./components/NotFound";

// Wraps *all* pages in your shared chrome
function PublicLayout({version, toggleVersion}) {
  return (
    <Layout>
      <Header toggleVersion={toggleVersion} version={version}/>
      {version === "v1" ? 
        (
          <main className="flex-1 p-2 sm:p-6">
            <Outlet />
          </main>
        ) : (
          <main className="flex-1">
            <Outlet />
          </main>
        )
    }
      {/* <Footer /> */}
    </Layout>
  );
}
// Redirect to /login if no token
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function Main() {
  const [version, setVersion] = useState(
    () => localStorage.getItem("appVersion") || "v1"
  );
  useEffect(() => {
    localStorage.setItem("appVersion", version);
  }, [version]);
  const toggleVersion = () =>
    setVersion((v) => (v === "v1" ? "v2" : "v1"));

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout version={version} toggleVersion={toggleVersion} />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/404" element={<NotFound />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <ProtectedLayout
                  version={version}
                  useV2={version === "v2"}
                />
              </RequireAuth>
            }
          >
            <Route
              index
              element={<AppV1 />}
            />
            <Route path="/404" element={<NotFound />} />
          </Route>

          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>
  );
}
