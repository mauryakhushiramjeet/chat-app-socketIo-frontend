import * as yup from "yup";

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])/,
      "Password must contain uppercase, lowercase, number and special character",
    ),

  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    // .matches(
    //   /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])/,
    //   "Password must contain uppercase, lowercase, number and special character",
    // ),
});
export const signupSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])/,
      "Password must contain uppercase, lowercase, number and special character",
    ),
});
export const forgetPassword_EmailSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
});
export const forgetPassword_OtpSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});
