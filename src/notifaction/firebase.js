import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD89chWMuAV1Gzkp3eQsExwwhPwbySSdWI",
  authDomain: "pingpong-notification.firebaseapp.com",
  projectId: "pingpong-notification",
  storageBucket: "pingpong-notification.firebasestorage.app",
  messagingSenderId: "496629394406",
  appId: "1:496629394406:web:e154394b98619ffd3c0427",
};

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
