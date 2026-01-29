import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const verifyOtp = createAsyncThunk(
  "auth/otpverify",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/verifyEmailOtp", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signup failed");
    }
  },
);
export const resendEmailVerification = createAsyncThunk(
  "auth/resendMail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/resendMail", email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "resend mail failed");
    }
  },
);
export const resendMailForgetPassword = createAsyncThunk(
  "auth/resendForgetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/resendMailForgetPassword", {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "resend mail failed");
    }
  },
);
export const forgetPassword_EmailVerify = createAsyncThunk(
  "auth/email_verify",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/forgetPassword_EmailVerify", {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data.message || "resend mail failed",
      );
    }
  },
);
