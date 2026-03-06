import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

// blockerId, blockedId
export const blockUser = createAsyncThunk(
  "auth/block",
  async ({ blockerId, blockedId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/blockUser", {
        blockerId,
        blockedId,
      });
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
export const unBlockUser = createAsyncThunk(
  "auth/unBlock",
  async ({ blockerId, blockedId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete("/unBlockUser", {
        data: {
          blockerId,
          blockedId,
        },
      });
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

export const getAllBlockedUsers = createAsyncThunk(
  "auth/allblockedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/getAllBlockedUsers");
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
