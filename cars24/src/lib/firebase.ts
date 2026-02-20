import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDyh3tSSmcXfvCaYBGuZS0_xScWsurb7Tw",
  authDomain: "cars24-notifications.firebaseapp.com",
  projectId: "cars24-notifications",
  storageBucket: "cars24-notifications.firebasestorage.app",
  messagingSenderId: "151616606231",
  appId: "1:151616606231:web:fda591397f7dd2c81b4c52"
};


const app = initializeApp(firebaseConfig);

let messaging: any = null;

if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

export { messaging, getToken, onMessage };