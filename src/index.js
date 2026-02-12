import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./store/store";
import { ProfileContextProvider } from "./utills/context/ProfileContext";
import { NotificationContextProvider } from "./utills/context/NotificationContext";

// Register Firebase Cloud Messaging service worker
if ("serviceWorker" in navigator) {
  // Register the custom service worker for Firebase messaging
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log(
        "Firebase messaging service worker registered successfully:",
        registration.scope,
      );
    })
    .catch((error) => {
      console.error(
        "Firebase messaging service worker registration failed:",
        error,
      );
    });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {" "}
      <ProfileContextProvider>
        <NotificationContextProvider>
          <App />
        </NotificationContextProvider>
      </ProfileContextProvider>
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
