import { createSlice } from "@reduxjs/toolkit";
import { getGroupMessages } from "../actions/messageActions"; 

const getGroupMessagesSlice = createSlice({
  name: "groupMessages",
  initialState: {
    messages: [],
    isLoading: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGroupMessages.pending, (state) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getGroupMessages.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.messages = action.payload; 
      })
      .addCase(getGroupMessages.rejected, (state) => {
        state.isError = true;
        state.isLoading = false;
      });
  },
});

export default getGroupMessagesSlice.reducer;
