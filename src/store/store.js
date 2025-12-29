import { configureStore } from "@reduxjs/toolkit";
import friendReducer from "./slice/userSlice.js";
import messageReducer from "./slice/messagesSllice.js";
import conversationUserReducer from "./slice/conversationsUserSlice.js";
const store = configureStore({
  reducer: {
    friends: friendReducer,
    messages: messageReducer,
    conversationUser:conversationUserReducer
  },
});
export default store;
