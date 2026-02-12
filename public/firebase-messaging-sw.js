/* eslint-disable no-undef, no-restricted-globals */

importScripts(
  "https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyD89chWMuAV1Gzkp3eQsExwwhPwbySSdWI",
  authDomain: "pingpong-notification.firebaseapp.com",
  projectId: "pingpong-notification",
  storageBucket: "pingpong-notification.firebasestorage.app",
  messagingSenderId: "496629394406",
  appId: "1:496629394406:web:e154394b98619ffd3c0427",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging
const messaging = firebase.messaging();

// // Handle incoming push notifications
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  // Check if payload has notification or data
  const notificationTitle = payload.data?.title || "PingPong";
  const notificationOptions = {
    body: payload.data?.body || "You have a new message",
    icon: payload.data?.image || "/icons/logo.png",
    badge: "/icons/logo.png",
    // tag: payload.data?.tag || "chat-notification",
    // data: payload.data,
  };

  // Show the notification
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Handle notification click event
self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked ", event.notification.tag);

  event.notification.close();

  // Define the URL to open when notification is clicked
  const chatUrl = "http://localhost:3000";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(chatUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(chatUrl);
        }
      }),
  );
});

// Handle push event as a fallback
// self.addEventListener("push", function (event) {
//   console.log("[firebase-messaging-sw.js] Push event received ", event);

//   if (event.data) {
//     const data = event.data.json();
//     // console.log("[firebase-messaging-sw.js] Push data ", data);

//     // Handle both notification and data payloads
//     const notificationTitle = data.data?.title || "New Message";
//     const notificationOptions = {
//       body: data.data?.body || "You have a new message",
//       icon: data.data?.image || "/icons/logo.png",
//       badge: data.data?.badge || "/icons/logo.png",
//       // tag: data.data?.tag || "chat-notification",
//       // data: data.data,
//     };

//     event.waitUntil(
//       self.registration.showNotification(
//         notificationTitle,
//         notificationOptions,
//       ),
//     );
//   }
// });
