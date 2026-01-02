import { createSlice } from "@reduxjs/toolkit";
import { getSidebarChatList } from "../actions/sidebarChatListActions";

const sidebarChatListSlice = createSlice({
  name: "sidebarChatList",
  initialState: {
    chatList: [],
    isLoading: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (building) => {
    building
      .addCase(getSidebarChatList.pending, (state, action) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getSidebarChatList.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.chatList = action.payload;
      })
      .addCase(getSidebarChatList.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
      });
  },
});

export default sidebarChatListSlice.reducer;
