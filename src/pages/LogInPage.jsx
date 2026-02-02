import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { loginUser } from "../store/actions/userActions";
import { email_verify_Schema, loginSchema } from "../utills/authSchema";
import { resendEmailVerification } from "../store/actions/verifyOtpActions";

const LoginPage = ({ setCurrentForm, currentForm, setIsOtpSend }) => {
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [showEmailVerifyFeild, setShowEmailVerifyFeild] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const login_InitialValue = {
    email: "",
    password: "",
  };
  const verifyEmail_InitialValue = {
    email: "",
    password: "",
  };

  const { handleChange, handleBlur, handleSubmit, values, errors, touched } =
    useFormik({
      initialValues: showEmailVerifyFeild
        ? verifyEmail_InitialValue
        : login_InitialValue,
      validationSchema: showEmailVerifyFeild
        ? email_verify_Schema
        : loginSchema,
      onSubmit: async (values) => {
        setLoading(true);
        try {
          if (showEmailVerifyFeild) {
            dispatch(resendEmailVerification({ email: values.email }))
              .unwrap()
              .then((res) => {
                if (res.success) {
                  toast.success(res.message);
                  setIsOtpSend(true);
                } else {
                  toast.error(res.message);
                }
              });
          } else {
            const res = await dispatch(
              loginUser({ email: values.email, password: values.password }),
            ).unwrap();

            if (res.success) {
              toast.success(res.message);
              localStorage.setItem("userData", JSON.stringify(res.user));
              navigate("/chat");
            } else {
              toast.error(res.message);
            }
          }
        } catch (err) {
          console.log(err);
          toast.error(err);
          if (err === "Email is not verify") {
            setIsUnverified(true);
          }
        } finally {
          setLoading(false);
        }
      },
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#574CD6]/60 p-4">
      <div className="bg-white shadow-xl rounded-[25px] p-8 w-full max-w-md">
        {showEmailVerifyFeild ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Verify Email
            </h1>
            <p className="text-center text-gray-500 text-sm mb-4">
              Enter your email to receive a new verification link.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="petermiller@gmail.com"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all"
              >
                {loading ? "Sending..." : "Send Verification Link"}
              </button>
              <button
                onClick={() => setShowEmailVerifyFeild(false)}
                className="w-full text-indigo-600 text-sm font-semibold hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-[#1a1a1a] mb-8">
              Login
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-600 font-medium mb-1 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="petermiller@gmail.com"
                />
                {touched.email && errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1 text-sm">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    touched.password && errors.password
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="........"
                />
                {touched.password && errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
                    isUnverified
                      ? "bg-[#D1D5DB] text-white cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Login..." : "Login"}
                </button>

                {isUnverified && (
                  <button
                    type="button"
                    onClick={() => setShowEmailVerifyFeild(true)}
                    className="w-full bg-white border-[1.5px] border-indigo-400 text-indigo-500 py-3 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors"
                  >
                    Resend Verification Email
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Create new account?{" "}
                <span
                  onClick={() => setCurrentForm("signup")}
                  className="text-indigo-500 font-semibold hover:underline cursor-pointer"
                >
                  Signup
                </span>
              </p>
              <p
                onClick={() => setCurrentForm("forget-password")}
                className="text-sm text-indigo-500 font-semibold mt-2 cursor-pointer hover:underline"
              >
                Forgot Password?
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
