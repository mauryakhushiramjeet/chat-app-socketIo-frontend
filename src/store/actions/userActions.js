import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const getLogedInUser = createAsyncThunk(
  "auth/loginuserDetailes",
  async (id, { rejectWithValue }) => {
    try {
      const resposne = await axiosInstance.get(`/logedInUser/${id}`);
      if (resposne.data.success) {
        return resposne.data;
      } else {
        return rejectWithValue(resposne.data.message);
      }
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message);
    }
  }
);
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/signup", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signup failed");
    }
  }
);
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Something went wrong "
      );
    }
  }
);

export const getAllFriends = createAsyncThunk(
  "get/freinds",
  async (id, { rejectWithValue }) => {
    try {
      console.log(id)
      const resposne = await axiosInstance.get(`/getFriends/${id}`);
      return resposne.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);
