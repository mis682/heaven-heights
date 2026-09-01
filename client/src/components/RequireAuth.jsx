import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ permission, children }) {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  // Sessions created before password-protected login was added have no
  // token — treat them as logged out so everyone re-authenticates once.
  if (!user || !user.token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (permission && !hasPermission(permission.module, permission.action)) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg font-semibold text-heading">Access restricted</p>
        <p className="text-sm text-subtext mt-1">You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
