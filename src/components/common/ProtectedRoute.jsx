import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute — wraps dashboard routes.
 * - If no token/user → redirect to /login
 * - If user role is not "admin" → redirect to /login
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("adminAccessToken");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser"));
    } catch {
      return null;
    }
  })();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    // Clear stale non-admin session
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");
    return <Navigate to="/login" replace />;
  }

  return children;
}
