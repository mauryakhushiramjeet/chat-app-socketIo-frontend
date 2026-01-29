import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { loginUser } from "../store/actions/userActions";
import { loginSchema } from "../utills/authSchema";

const LoginPage = ({ setCurrentForm, currentForm, setIsOtpSend }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = {
    email: "",
    password: "",
  };

  const { handleChange, handleBlur, handleSubmit, values, errors, touched } =
    useFormik({
      initialValues,
      validationSchema: loginSchema,
      onSubmit: async (values) => {
        setLoading(true);

        try {
          const res = await dispatch(
            loginUser({ email: values.email, password: values.password })
          ).unwrap();

          if (res.success) {
            toast.success(res.message);
            localStorage.setItem("userData", JSON.stringify(res.user));
            navigate("/chat");
          } else {
            toast.error(res.message);
          }
        } catch (err) {
          console.log(err);
          toast.error(err);
        } finally {
          setLoading(false);
        }
      },
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#574CD6]/60 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                touched.email && errors.email ? "border-red-500" : ""
              }`}
              placeholder="you@example.com"
            />
            {touched.email && errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                touched.password && errors.password ? "border-red-500" : ""
              }`}
              placeholder="Enter your password"
            />
            {touched.password && errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
          >
            {loading ? "Login..." : "LogIn"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          Create new account?{" "}
          <span
            onClick={() => setCurrentForm("signup")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Signup
          </span>
        </p>
        <div className="flex items-center justify-center">
          <p
            onClick={() => setCurrentForm("forget-password")}
            className="w-fit text-center text-sm text-indigo-600 mt-2 cursor-pointer hover:underline"
          >
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;