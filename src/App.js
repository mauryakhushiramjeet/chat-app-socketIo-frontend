import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/Signup";
import ChatPage from "./pages/ChatPage";
import { ToastContainer } from "react-toastify";
import LoginPage from "./pages/LogInPage";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthForm from "./pages/AuthForm";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<AuthForm />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
