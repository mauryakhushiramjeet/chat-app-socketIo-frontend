import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  console.log("user in public route", user);
  return user && user?.isEmailVerify ? (
    <Navigate to="/chat" replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
