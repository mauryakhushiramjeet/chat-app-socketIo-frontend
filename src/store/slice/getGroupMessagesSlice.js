import { createSlice } from "@reduxjs/toolkit";
import { getGroupMessages } from "../actions/messageActions";
import { act } from "react";

const getGroupMessagesSlice = createSlice({
  name: "groupMessages",
  initialState: {
    messages: [],
    members: [],
    loadType: null,
    isLoading: false,
    isError: false,
    fisrtMessageId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGroupMessages.pending, (state) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getGroupMessages.fulfilled, (state, action) => {
        // console.log(action.payload, "this i action .payload");
        state.isError = false;
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.members = action.payload.users;
        state.loadType = action.payload.loadType;
        state.fisrtMessageId = action.payload.firstMessageId;
      })
      .addCase(getGroupMessages.rejected, (state) => {
        state.isError = true;
        state.isLoading = false;
      });
  },
});

export default getGroupMessagesSlice.reducer;
