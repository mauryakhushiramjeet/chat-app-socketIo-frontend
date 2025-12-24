import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const getAllMesages = createAsyncThunk(
  "get/messages",
  async ({ senderId, receiverId }, { rejectWithValue }) => {
    try {
      const resposne = await axiosInstance.get("/getMessages", {
        params: { senderId, receiverId },
      });
      console.log(resposne)
      return resposne.data.messages;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);
