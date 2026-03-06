import { createContext, useState } from "react";

export const NotificationContext = createContext(null);
export const NotificationContextProvider = ({ children }) => {
  const [notificationData, setNotificationData] = useState({
    name: "",
    message: "",
    image: "",
    type: "",
    groupName: null,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [fcmToken, setFcmTokens] = useState({});
  const [blockedUsers, setBlockedUsers] = useState([]);
  return (
    <NotificationContext.Provider
      value={{
        notificationData,
        setNotificationData,
        showNotification,
        setShowNotification,
        fcmToken,
        setFcmTokens,
        blockedUsers,
        setBlockedUsers,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
