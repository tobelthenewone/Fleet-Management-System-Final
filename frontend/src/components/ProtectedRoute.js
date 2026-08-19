import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  element: Component,
  isAuthenticated,
  allowedRoles,
  userRole,
}) => {
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/fms/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to login with error message if unauthorized
    localStorage.setItem(
      "authError",
      "You do not have permission to access this page"
    );
    return <Navigate to="/fms/" replace />;
  }

  // Render the component if authenticated and authorized
  return Component;
};

export default ProtectedRoute;
