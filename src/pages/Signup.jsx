// SignupPage.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { signupUser } from "../store/actions/userActions.js";
import { useFormik } from "formik";
import { signupSchema } from "../utills/authSchema.js";
const SignupPage = ({ setIsOtpSend, setCurrentForm }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const initialValues = {
    email: "",
    password: "",
    name: "",
  };

  const { handleChange, handleBlur, handleSubmit, values, errors, touched } =
    useFormik({
      initialValues,
      validationSchema: signupSchema,
      onSubmit: async (values) => {
        setLoading(true);

        try {
          const formData = new FormData();
          formData.append("name", values.name);
          formData.append("email", values.email);
          formData.append("password", values.password);
          formData.append("image", image);
          dispatch(signupUser(formData))
            .unwrap()
            .then((res) => {
              console.log(res);
              if (res.success) {
                toast.success(res.message);
                localStorage.setItem("userData", JSON.stringify(res.data));
                setIsOtpSend(true);
              } else {
                toast.error(res.message);
              }
            });
        } catch (err) {
          console.log(err);
        }
      },
    });
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#574CD6]/60 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={values.name}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your full name"
            />
            {touched.name && errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={values.email}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="you@example.com"
            />
            {touched.email && errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={values.password}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your password"
            />
            {touched.password && errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="profile"
                className="h-[80px] w-[80px]"
              />
            ) : (
              <>
                <input
                  type="file"
                  role="button"
                  name="image"
                  id="image"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <label htmlFor="image" className="cursor-pointer">
                  Choose profile image
                </label>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => setCurrentForm("login")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            login
          </span>
        </p>
      </div>
    </div>
  );
};
export default SignupPage;
