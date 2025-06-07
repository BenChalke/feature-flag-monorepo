// src/components/ProtectedLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import useSessionValidator from "../hooks/useSessionValidator";
import Layout from "./Layout";

export default function ProtectedLayout() {
  // this will only run for protected routes
  useSessionValidator(/* optional interval */);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
