const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api";

export const sendMessage = async (messageData: any) => {
  const response = await fetch(`${API_BASE_URL}/Chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return await response.json();
};