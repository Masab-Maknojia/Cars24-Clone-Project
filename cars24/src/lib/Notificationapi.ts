const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api";

export const sendPushNotification = async (userId: string, title: string, body: string) => {
  const response = await fetch(`${API_BASE_URL}/Notification/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // This matches your C# NotificationRequest model perfectly!
    body: JSON.stringify({ userId, title, body }), 
  });

  if (!response.ok) {
    throw new Error("Failed to trigger push notification");
  }
  return response.json();
};