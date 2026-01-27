import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const verifyOtp = createAsyncThunk(
  "auth/otpverify",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/verifyEmailOtp", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signup failed");
    }
  }
);