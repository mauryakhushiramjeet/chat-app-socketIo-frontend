import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Signup";
import ChatPage from "./pages/ChatPage";
import { ToastContainer } from "react-toastify";
import LoginPage from "./pages/LogInPage";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          {" "}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<LoginPage />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
        <Route path="/signup" element={<LoginPage />} />

        {/* 404 */}
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
