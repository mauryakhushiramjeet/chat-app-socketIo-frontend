import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const createGroup = createAsyncThunk(
  "post/group",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/createGroup", formData);
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
export const getUserSeenMsgDetaiils = createAsyncThunk(
  "get/group",
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/userLastMsgSeenDetail", {
        params: { groupId, userId },
      });
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);
