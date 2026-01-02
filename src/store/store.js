import { configureStore } from "@reduxjs/toolkit";
import friendReducer from "./slice/userSlice.js";
import messageReducer from "./slice/messagesSllice.js";
import conversationUserReducer from "./slice/conversationsUserSlice.js";
import myMessagesReducer from "./slice/getMyMessagesSlice.js";
import sidebarChatListReducer from "./slice/sidebarChatListSlice.js";
import groupMessageReducer from "./slice/getGroupMessagesSlice.js";
const store = configureStore({
  reducer: {
    friends: friendReducer,
    messages: messageReducer,
    conversationUser: conversationUserReducer,
    getMyMessages: myMessagesReducer,
    sidebarChatList: sidebarChatListReducer,
    groupMessages: groupMessageReducer,
  },
});
export default store;
