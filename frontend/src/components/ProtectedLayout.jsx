// frontend/src/components/ProtectedLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import useSessionValidator from "../hooks/useSessionValidator";
import Layout from "./Layout";
import SessionExpiredModal from "./SessionExpiredModal";
import AppV2 from "./v2/AppV2";


export default function ProtectedLayout({ version, useV2 }) {
  const [expired, setExpired] = useState(false);

  // periodic session check
  useSessionValidator(() => setExpired(true));

  // catch any 401 from fetcher
  useEffect(() => {
    const onExpired = () => setExpired(true);
    window.addEventListener("session-expired", onExpired);
    return () => window.removeEventListener("session-expired", onExpired);
  }, []);

  const handleClose = () => {
    setExpired(false);
    window.location.href = "/login";
  };

  return (
    <>
      {/* main content */}
      {version === "v1" && !useV2 ? (
        <Outlet />
      ) : (
        <>{useV2 ? <AppV2 /> : null}</>
      )}

      {expired && <SessionExpiredModal onClose={handleClose} />}
    </>
  );
}
