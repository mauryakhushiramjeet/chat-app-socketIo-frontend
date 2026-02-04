import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const getSidebarChatList = createAsyncThunk(
  "get/getsidebarChatList",
  async ({ loggedInUserId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/getSidebarChatList", {
        params: { loggedInUserId },
      });
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message||error?.message);
    }
  }
);
