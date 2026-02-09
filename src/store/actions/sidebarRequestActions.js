import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const getPendingReuests = createAsyncThunk(
  "get/getPendingReuests",
  async ({ loggedInUserId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/getPendingRequest", {
        params: { loggedInUserId },
      });
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
export const acceptChatRequest = createAsyncThunk(
  "get/acceptRequest",
  async ({ conversationId, loggedInUserId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/acceptRequest", {
        conversationId,
        loggedInUserId,
      });
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
