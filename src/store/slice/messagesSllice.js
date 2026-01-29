import { createSlice } from "@reduxjs/toolkit";
import { getAllMessages } from "../actions/messageActions.js";
const getAllMessagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    loadType: null,
    isLoading: false,
    isError: false,
    fisrtMessageId: null,
  },
  reducers: {},
  extraReducers: (building) => {
    building
      .addCase(getAllMessages.pending, (state, action) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getAllMessages.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.loadType = action.payload.loadType;
        state.fisrtMessageId = action.payload.firstMessageId;
      })

      .addCase(getAllMessages.rejected, (state, action) => {
        state.isError = true;
        state.true = false;
      });
  },
});

export default getAllMessagesSlice.reducer;
