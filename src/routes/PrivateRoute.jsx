import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
