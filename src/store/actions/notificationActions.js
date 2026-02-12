import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const saveFcmToken = createAsyncThunk(
  "notification/saveToken",
  async ({ fcmToken, userId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/save-fcm-token", {
        fcmToken,
        userId,
      });

      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
