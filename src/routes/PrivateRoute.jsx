import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  // console.log("user in private route", user);

  return user && user?.isEmailVerify ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
