import { createSlice } from "@reduxjs/toolkit";
import { getAllFriends } from "../actions/userActions.js";
const getAllFriendsSlice = createSlice({
  name: "friends",
  initialState: {
    user: [],
    isLoading: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (building) => {
    building
      .addCase(getAllFriends.pending, (state, action) => {
        state.isError = false;
        state.isLoading = true;
      })
      .addCase(getAllFriends.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getAllFriends.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
      });
  },
});

export default getAllFriendsSlice.reducer;
