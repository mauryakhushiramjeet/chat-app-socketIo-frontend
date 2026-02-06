import React, { useState } from "react";
import SignupPage from "./Signup";

import VerifyEmailPage from "./VerifyEmailPage";
import LoginPage from "./LogInPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";

const AuthForm = () => {
  const [currentForm, setCurrentForm] = useState("signup");
  const [isOtpSend, setIsOtpSend] = useState(false);
  const renderForm = () => {
    switch (currentForm) {
      case "signup":
        return (
          <SignupPage
            setIsOtpSend={setIsOtpSend}
            setCurrentForm={setCurrentForm}
          />
        );
      case "login":
        return (
          <LoginPage
            setCurrentForm={setCurrentForm}
            currentForm={currentForm}
            setIsOtpSend={setIsOtpSend}
          />
        );
      case "forget-password":
        return (
          <ForgotPasswordPage
            setIsOtpSend={setIsOtpSend}
            setCurrentForm={setCurrentForm}
          />
        );
      case "reset-password":
        return (
          <ResetPasswordPage
            setCurrentForm={setCurrentForm}
            setIsOtpSend={setIsOtpSend}
          />
        );
      default:
        return <div>Invalid Form</div>;
    }
  };
  return (
    // bg-[#574CD6]/60
    <div className="bg-[#574CD6]/70">
      {isOtpSend ? (
        <VerifyEmailPage
          currentForm={currentForm}
          setCurrentForm={setCurrentForm}
          //   email={JSON.parse(localStorage.getItem("userData").email)}
          setIsOtpSend={setIsOtpSend}
        />
      ) : (
        renderForm()
      )}
    </div>
  );
};

export default AuthForm;
