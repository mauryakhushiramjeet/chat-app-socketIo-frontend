import { createSlice } from "@reduxjs/toolkit";
import { getAllReceiverMesages } from "../actions/messageActions.js";
const getMyMessagesSlice = createSlice({
  name: "getMyMessages",
  initialState: {
    messages: [],
    isLoading: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (building) => {
    building
      .addCase(getAllReceiverMesages.pending, (state, action) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getAllReceiverMesages.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(getAllReceiverMesages.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
      });
  },
});

export default getMyMessagesSlice.reducer;
