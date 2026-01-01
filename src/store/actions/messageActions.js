import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const getAllMessages = createAsyncThunk(
  "get/messages",
  async ({ senderId, receiverId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/getMessages", {
        params: { senderId, receiverId },
      });
      // console.log(response);
      return response.data.messages;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);
export const getAllReceiverMesages = createAsyncThunk(
  "get/getAllMyMessages",
  async ({ receiverId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/getAllMyMessages", {
        params: { receiverId },
      });
      // console.log(response);
      // console.log(response.data.messages, "in api cheaking at call");
      return response.data.messages;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);
