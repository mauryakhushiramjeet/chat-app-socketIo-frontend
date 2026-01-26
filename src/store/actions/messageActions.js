import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const getAllMessages = createAsyncThunk(
  "get/messages",
  async ({ senderId, receiverId, lastMessageId }, { rejectWithValue }) => {
    try {
      console.log(senderId, receiverId, lastMessageId, "idssss");
      const response = await axiosInstance.get("/getMessages", {
        params: { senderId, receiverId, lastMessageId },
      });
      // console.log(response);
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  },
);
// For chaeking at receiver side to update its message status
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
  },
);
export const sendMessage = createAsyncThunk(
  "post/message",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/addMessage", formData);
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  },
);
export const sendGroupMessage = createAsyncThunk(
  "post/groupMessage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/addGroupMessage", formData);
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  },
);

export const getGroupMessages = createAsyncThunk(
  "get/groupMessages",
  async ({ senderId, groupId, lastMessageId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/getGroupMessages", {
        params: { senderId, groupId, lastMessageId },
      });
     
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(
        error?.response?.data?.message || "Something went wrong",
      );
    }
  },
);
export const updateMessageFile = createAsyncThunk(
  "post/updateMessageFile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/updateMessageFile", formData);
      return response.data;
    } catch (error) {
      console.log("AXIOS ERROR:", error.response);
      return rejectWithValue(error?.response?.data?.message);
    }
  },
);
