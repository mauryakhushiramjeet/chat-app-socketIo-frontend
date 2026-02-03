import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const getLogedInUser = createAsyncThunk(
  "auth/loginuserDetailes",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/logedInUser/${id}`);
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message);
    }
  },
);
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/signup", formData);
      return response.data;
    } catch (error) {
      console.log(error, "error in signp");
      return rejectWithValue(error.response?.data || "Signup failed");
    }
  },
);
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Something went wrong ",
      );
    }
  },
);

export const getAllFriends = createAsyncThunk(
  "get/freinds",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/getFriends/${id}`);
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  },
);
export const resetPassword = createAsyncThunk(
  "get/freinds",
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/resetPassword`, {
        email,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  },
);
export const getConversationsUsers = createAsyncThunk(
  "get/convUser",
  async (loggedInUserId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/userConversations", {
        params: { loggedInUserId },
      });
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  "update/profile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/updateProfile", formData);
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  },
);
