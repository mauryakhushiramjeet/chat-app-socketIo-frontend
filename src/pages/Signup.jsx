// SignupPage.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signupUser } from "../store/actions/userActions.js"

const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (!form.name || !form.email || !form.password) {
      setMessage("All fields are required!");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("image", image);
      dispatch(signupUser(formData))
        .unwrap()
        .then((res) => {
          console.log(res);
          if (res.success) {
            toast.success(res.message);
            localStorage.setItem("userData", JSON.stringify(res.data));
            navigate("/chat");
          } else {
            toast.error(res.message);
          }
        });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#574CD6]/60 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h1>

        {message && (
          <p
            className={`text-center mb-4 ${
              message.includes("successful") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your password"
            />
          </div>
          <div>
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="profile image"
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
          <a href="/" className="text-indigo-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};
export default SignupPage;
