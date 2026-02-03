import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { loginUser } from "../store/actions/userActions";
import { email_verify_Schema, loginSchema } from "../utills/authSchema";
import { resendEmailVerification } from "../store/actions/verifyOtpActions";
import SubmitButton from "../component/SubmitButton";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";

const LoginPage = ({ setCurrentForm, currentForm, setIsOtpSend }) => {
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [showEmailVerifyFeild, setShowEmailVerifyFeild] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
                  localStorage.setItem(
                    "userData",
                    JSON.stringify({ email: values.email }),
                  );
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
    <div className="min-h-screen flex items-center justify-center  p-2">
      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 md:p-7 w-full max-w-md">
        {showEmailVerifyFeild ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Verify Email
            </h1>
            <p className="text-center text-gray-500 text-sm mb-4">
              Enter your email to receive a new verification link.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
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
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all 
                      "border-gray-200
                    `}
                  />
                </div>

                <SubmitButton
                  type="submit"
                  loading={loading}
                  buttonName={"Send Verification Link"}
                  disabled={loading}
                />
                <button
                  onClick={() => setShowEmailVerifyFeild(false)}
                  className="w-full text-indigo-600 text-sm font-semibold hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-2 lg:mb-6">
              Login
            </h1>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm md:text-base">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 border rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 border-[#4F46E5]/30
                  `}
                  placeholder="petermiller@gmail.com"
                />
                {touched.email && errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm md:text-base">
                  Password
                </label>
                <div className="relative flex items-center ">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 border-[#4F46E5]/30
                      
                     `}
                    placeholder="........"
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="cursor-pointer right-3 text-[#4338CA]/80 text-xl sm:text-2xl absolute"
                  >
                    {!showPassword ? <IoEyeOff /> : <IoEye />}
                  </span>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="pt-2 space-y-3">
                <SubmitButton
                  type="submit"
                  loading={loading}
                  buttonName={"Login"}
                  disabled={loading}
                  className={false}
                />

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
              <p className="text-gray-600 text-sm md:text-base">
                Create new account?{" "}
                <span
                  onClick={() => setCurrentForm("signup")}
                  className="text-indigo-500 font-semibold hover:underline cursor-pointer"
                >
                  Signup
                </span>
              </p>
              <button
                type="button"
                onClick={() => setCurrentForm("forget-password")}
                className="text-sm text-indigo-500 font-semibold mt-2 cursor-pointer hover:underline md:text-base"
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
