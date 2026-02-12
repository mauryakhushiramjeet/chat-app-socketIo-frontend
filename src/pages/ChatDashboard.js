import React, { useContext, useEffect } from "react";
import ChatPage from "./ChatPage";
import { getToken, onMessage } from "firebase/messaging";
import { useDispatch } from "react-redux";
import { saveFcmToken } from "../store/actions/notificationActions";
import { messaging } from "../notifaction/firebase";
import { NotificationContext } from "../utills/context/NotificationContext";

const ChatDashboard = () => {
  const dispatch = useDispatch();
  const {
    showNotification,
    setShowNotification,
    notificationData,
    setNotificationData,
  } = useContext(NotificationContext);
  async function notificationReqPermission() {
    const loggedUserDetailes = JSON.parse(localStorage.getItem("userData"));

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      //   console.log("Notification permission granted.");
      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_CLOUD_MESSAGE_TOKEN,
      });

      dispatch(saveFcmToken({ fcmToken, userId: loggedUserDetailes?.id }));
      console.log(fcmToken);
    } else if (permission === "default") {
      alert("permission notification should appear");
    } else if (permission === "denied") {
      alert("permission block for this application");
    } else {
      console.warn("Unknown notification permission state:", permission);
    }
  }
  useEffect(() => {
    notificationReqPermission();
  }, []);
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received action:", payload);

      // Check if notification permission is granted
      if (Notification.permission === "granted") {
        const notificationTitle = payload.data?.title || "New Message";
        const notificationBody = payload.data?.body || "You have a new message";

        new Notification(notificationTitle, {
          body: notificationBody,
          icon: payload.notification?.image,
          badge: "/icons/logo.png",
          // tag: "chat-notification",
        });
        // const name = payload.notification?.title;
        // const message = payload.notification?.body;
        // const image = payload.notification?.image;
        // const type = payload.data?.type;
        // setNotificationData({ name, message, image, type });
        // setShowNotification(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return <ChatPage />;
};

export default ChatDashboard;
