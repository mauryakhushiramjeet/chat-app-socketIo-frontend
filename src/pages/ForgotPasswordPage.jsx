import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { forgetPassword_EmailVerify } from "../store/actions/verifyOtpActions";
import { forgetPassword_EmailSchema } from "../utills/authSchema";
import { useFormik } from "formik";
import SubmitButton from "../component/SubmitButton";
// import { forgotPassword } from "../store/actions/authActions"; // Adjust path as needed

const ForgotPasswordPage = ({ setIsOtpSend, setCurrentForm }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const initialValues = {
    email: "",
  };
  const { handleChange, handleBlur, handleSubmit, values, errors, touched } =
    useFormik({
      initialValues,
      validationSchema: forgetPassword_EmailSchema,
      onSubmit: async (values) => {
        setLoading(true);
        const email = values.email;
        console.log(email, "in forgt");
        dispatch(forgetPassword_EmailVerify(email))
          .unwrap()
          .then((res) => {
            console.log(res);
            if (res.success) {
              toast.success(res.message);
              const userData = { email: email };
              console.log(userData);
              localStorage.setItem("userData", JSON.stringify(userData));
              setLoading(false);
              setIsOtpSend(true);
            }
          })
          .catch((error) => {
            console.log(error);
            toast.error(error);
            setLoading(false);
          });
      },
    });
  return (
    <div className="min-h-screen flex items-center justify-cente">
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>

        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-2 lg:mb-6">
          Forget Password
        </h1>
        <p className="text-gray-500 mb-5 lg:mb-8 text-center text-sm sm:text-base">
          Enter your email and we'll send you instructions to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm md:text-base">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={values.email}
              placeholder="name@company.com"
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-2 border rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 border-[#4F46E5]/30"
            />
            {touched.email && errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button> */}
          <SubmitButton
            type="submit"
            loading={loading}
            buttonName="Send Reset Link"
            isUnverified={false}
            disabled={loading}
          />
        </form>

        <div className="mt-5 2xl:mt-8 text-center">
          <p
            onClick={() => setCurrentForm("login")}
            className="text-indigo-600 font-semibold hover:underline flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
