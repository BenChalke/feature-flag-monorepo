import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import useSessionValidator from "../hooks/useSessionValidator";
import Layout from "./Layout";
import SessionExpiredModal from "./SessionExpiredModal";

export default function ProtectedLayout() {
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
      <Outlet />
      {expired && <SessionExpiredModal onClose={handleClose} />}
    </>
  );
}
