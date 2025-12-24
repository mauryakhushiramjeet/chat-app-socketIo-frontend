import { configureStore } from "@reduxjs/toolkit";
import friendReducer from "./slice/userSlice.js";
import messageReducer from "./slice/messagesSllice.js";
const store = configureStore({
  reducer: {
    friends: friendReducer,
    messages: messageReducer,
  },
});
export default store;
