import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const user = localStorage.getItem("token");
  return  user? (
    <Navigate to="/chat" replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
