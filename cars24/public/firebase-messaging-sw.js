importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDyh3tSSmcXfvCaYBGuZS0_xScWsurb7Tw",
  authDomain: "cars24-notifications.firebaseapp.com",
  projectId: "cars24-notifications",
  storageBucket: "cars24-notifications.firebasestorage.app",
  messagingSenderId: "151616606231",
  appId: "1:151616606231:web:fda591397f7dd2c81b4c52"
};


firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});