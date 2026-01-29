import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  resendEmailVerification,
  resendMailForgetPassword,
  verifyOtp,
} from "../store/actions/verifyOtpActions";
import { useNavigate } from "react-router-dom";

const VerifyEmailPage = ({ currentForm, setCurrentForm, setIsOtpSend }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errorOtp, setOtpError] = useState("");
  const [timer, setTimer] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);
  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => setResendCooldown((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

  useEffect(() => {
    const loggedUserDetailes = JSON.parse(localStorage.getItem("userData"));
    console.log(loggedUserDetailes);
    if (loggedUserDetailes?.email) {
      setEmail(loggedUserDetailes?.email);
    }
  }, []);
  // console.log(email);
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timer === 0) {
      setOtpError("OTP has expired. Please resend code.");
      return;
    }
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setOtpError("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    const data = { email, otp: otpValue };
    dispatch(verifyOtp(data))
      .unwrap()
      .then((res) => {
        if (res.success) {
          toast.success(res.message);
          setLoading(false);
          if (currentForm === "signup") {
            localStorage.setItem("userData", JSON.stringify(res.data));
            setCurrentForm("login");

            setIsOtpSend(false);
          }
          if (currentForm === "forget-password") {
            setCurrentForm("reset-password");
            setIsOtpSend(false);
          }
        } else {
          toast.error(res.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
        toast.error(error.message);
      });
  };

  const handleResend = () => {
    if (currentForm === "login") {
      // for email verify resend mail
      dispatch(resendEmailVerification(email))
        .unwrap()
        .then((res) => {
          if (res.success) {
            toast.success(res.message);
            setTimer(300);
            setResendCooldown(30);
            setOtp(new Array(6).fill(""));
          } else {
            toast.error(res.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if (currentForm === "forget-password") {
      console.log("jkhdsjha,email", email);
      dispatch(resendMailForgetPassword(email))
        .unwrap()
        .then((res) => {
          if (res.success) {
            toast.success(res.message);
            setTimer(300);
            setResendCooldown(30);
            setOtp(new Array(6).fill(""));
          } else {
            toast.error(res.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#574CD6]/60 p-4 font-sans">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {currentForm === "forget-password"
            ? "Reset Password"
            : "Verify Email"}
        </h1>
        <p className="text-gray-500 mb-8">
          We've sent a 6-digit verification code to <br />
          <span className="font-semibold text-gray-700">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                disabled={timer === 0} // Disable inputs if expired
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold outline-none transition-all ${
                  timer === 0
                    ? "bg-gray-100 border-gray-200 text-gray-400"
                    : "text-indigo-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                }`}
              />
            ))}
          </div>
          {errorOtp.trim() !== "" && (
            <p className="text-red-600 text-sm">{errorOtp}</p>
          )}
          {/* Expiration Message */}
          {timer === 0 ? (
            <p className="text-red-500 text-sm font-medium">
              OTP has expired. Please click "Resend Code" below.
            </p>
          ) : (
            <p className="text-red-500 text-sm font-medium">
              Otpis expireIn : {formatTime(timer)}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || timer === 0}
            className={`w-full py-3 rounded-xl transition-all font-semibold shadow-lg ${
              timer === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
            }`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-8">
          <p className="text-gray-500">
            Didn't receive the code?{" "}
            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={handleResend}
              className={`font-bold transition-all ${
                resendCooldown > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-indigo-600 hover:text-indigo-800 underline decoration-2 underline-offset-4"
              }`}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Code Now"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
