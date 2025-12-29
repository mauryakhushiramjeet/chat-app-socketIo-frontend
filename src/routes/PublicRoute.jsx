import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  return user ? <Navigate to="/chat" replace/> : <Outlet />;
};

export default PublicRoute;
