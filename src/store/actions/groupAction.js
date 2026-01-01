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
      return rejectWithValue(
        error.response?.data?.message || "Group creation failed"
      );
    }
  }
);
