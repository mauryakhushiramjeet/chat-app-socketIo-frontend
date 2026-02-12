/* eslint-disable no-restricted-globals */
/* eslint-env serviceworker */

self.addEventListener("push", (event) => {
  console.log(event, "Push event received");

  const data = event.data.json(); // data from FCM
  console.log("Push data", data);

  const notificationTitle = data.title || "PingPong";
  const notificationOptions = {
    body: data.body || "You have a new message",
    icon: "/icons/logo.png",
    data: {
      url: data.link || "/",
    },
  };

  // Make sure SW waits for the notification to display
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions),
  );
});

// Handle clicks on notification
self.addEventListener("notificationclick", (event) => {
  console.log(event, "CLICK ON NOTIFICATION");
  const notificationData = event.notification.data;
  event.notification.close();

  if (notificationData?.url) {
    event.waitUntil(clients.openWindow(notificationData.url));
  }
});
