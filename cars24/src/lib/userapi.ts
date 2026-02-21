//const API_BASE_URL = "http://localhost:5203/api/UserAuth";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api";

export const signup = async (
  email: string,
  password: string,
  userData: { fullName: string; phone: string }
) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, ...userData }),
  });
  if (!response.ok) {
      const text = await response.text();
      throw new Error(`Signup failed: ${text}`);
  }
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error("Failed to login");
  }
  return response.json();
};

export const getUserById = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
};

export const saveFcmToken = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/fcm-token`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, token }),
  });
  if (!response.ok) {
    console.error("Failed to save FCM token to backend");
  }
};

export const updateUserPreferences = async (userId: string, preferences: any) => {
  const response = await fetch(`${API_BASE_URL}/${userId}/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update preferences");
  }
  return response.json();
};