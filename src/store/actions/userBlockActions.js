import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const blockUser = createAsyncThunk(
  "user/block",
  async ({ blockedId, blockerId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/blockUser", {
        blockedId,
        blockerId,
      });

      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
export const unBlockUser = createAsyncThunk(
  "user/unBlock",
  async ({ blockedId, blockerId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete("/unBlockUser", {
        blockedId,
        blockerId,
      });

      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
export const checkUserBlock = createAsyncThunk(
  "user/checkUserBlockOrNot",
  async ({ blockedId, blockerId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/checkUserBlock", {
        params: blockedId,
        blockerId,
      });

      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
