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

  return (
    <NotificationContext.Provider
      value={{
        notificationData,
        setNotificationData,
        showNotification,
        setShowNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
