import { createSlice } from "@reduxjs/toolkit";
import { getConversationsUsers } from "../actions/userActions.js";
const conversationsUserSlice = createSlice({
  name: "conversationUser",
  initialState: {
    conversationUser: [],
    isLoading: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (building) => {
    building
      .addCase(getConversationsUsers.pending, (state, action) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getConversationsUsers.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.conversationUser = action.payload;
      })
      .addCase(getConversationsUsers.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
      });
  },
});

export default conversationsUserSlice.reducer;
