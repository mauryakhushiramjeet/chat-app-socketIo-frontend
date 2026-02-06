import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
// import { resetPassword } from "../store/actions/authActions";
import { useFormik } from "formik";
import { resetPassword } from "../store/actions/userActions";
import { resetPasswordSchema } from "../utills/authSchema";
import SubmitButton from "../component/SubmitButton";
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
        const newPassword = values.password;
        dispatch(resetPassword({ email, newPassword }))
          .unwrap()
          .then((res) => {
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
    <div className="min-h-screen flex items-center justify-center px-3">
      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 md:p-7 w-full max-w-md">
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

        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-2 lg:mb-6">
          Set New Password
        </h1>
        <p className="text-gray-500 mb-8 text-center text-sm sm:text-base">
          Your new password must be different from previously used passwords.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm md:text-base">
              {" "}
              New Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="•••••••"
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 border-[#4F46E5]/30"
            />
            {touched?.password && errors?.password && (
              <p className="text-red-600 text-sm mt-1">{errors?.password}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm md:text-base">
              {" "}
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 border-[#4F46E5]/30"
            />
            {touched?.confirmPassword && errors?.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors?.confirmPassword}
              </p>
            )}
          </div>

          {/* <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200 mt-2"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button> */}
          <SubmitButton
            type="submit"
            loading={loading}
            buttonName="Reset Password"
            isUnverified={false}
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
