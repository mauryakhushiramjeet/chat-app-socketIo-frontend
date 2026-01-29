import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import { resetPassword } from "../store/actions/authActions";
import { useFormik } from "formik";
import { resetPassword } from "../store/actions/userActions";
import { resetPasswordSchema } from "../utills/authSchema";
const ResetPasswordPage = ({ setCurrentForm, setIsOtpSend }) => {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const loggedUserDetailes = JSON.parse(localStorage.getItem("userData"));
    setEmail(loggedUserDetailes?.email);
  }, []);

  const initialValues = {
    password: "",
    confirmPassword: "",
  };
  const { handleBlur, handleChange, handleSubmit, errors, values, touched } =
    useFormik({
      initialValues,
      validationSchema: resetPasswordSchema,
      onSubmit: (value) => {
        setLoading(true);
        console.log(value);
        const newPassword = values.password;
        dispatch(resetPassword({ email, newPassword }))
          .unwrap()
          .then((res) => {
            console.log(res);
            if (res.success) {
              setLoading(false);
              toast.success(res.message);
              setCurrentForm("login");
              setIsOtpSend(false);
            } else {
              toast.error(res.message);
              setLoading(false);
            }
          })
          .cath((error) => {
            console.log(error);
            setLoading(false);
          });
      },
    });
  console.log(errors);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#574CD6]/60 p-4 font-sans">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        {/* Icon */}
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Set New Password
        </h1>
        <p className="text-gray-500 mb-8">
          Your new password must be different from previously used passwords.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
              New Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="•••••••"
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
            {touched?.password && errors?.password && (
              <p className="text-red-600 text-sm mt-1">{errors?.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
            {touched?.confirmPassword && errors?.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors?.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200 mt-2"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
