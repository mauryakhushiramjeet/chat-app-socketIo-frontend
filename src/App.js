import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import AuthForm from "./pages/AuthForm";

import ChatDashboard from "./pages/ChatDashboard";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<AuthForm />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<ChatDashboard />} />
        </Route>
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
