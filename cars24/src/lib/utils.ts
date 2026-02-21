import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const sendLocalNotification = async (title: string, body: string) => {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      if ("serviceWorker" in navigator) {
        let registration = await navigator.serviceWorker.getRegistration("/");
        if (!registration) {
          registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
        }
        if (registration) {
          await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            body: body,
            icon: "/favicon.ico"
          });
          return; // Exit if mobile worker succeeded
        }
      }
      // Fallback for Desktop
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  } catch (err) {
    console.error("Local notification failed silently:", err);
  }
};