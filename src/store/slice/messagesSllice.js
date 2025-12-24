import { createSlice } from "@reduxjs/toolkit";
import { getAllMesages } from "../actions/messageActions.js";
const getAllMessagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    isLoading: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (building) => {
    building
      .addCase(getAllMesages.pending, (state, action) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getAllMesages.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(getAllMesages.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
      });
  },
});

export default getAllMessagesSlice.reducer;
