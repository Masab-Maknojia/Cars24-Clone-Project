//const BASE_URL = "http://localhost:5203/api/Booking";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api";

export const createBooking = async (userid: string, Booking: any) => {
  const response = await fetch(`${API_BASE_URL}/Booking?userId=${userid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Booking),
  });
  return response.json();
};

export const getBookingbyid = async (id: string) => {
  // Added the missing slash right before ${id}!
  const response = await fetch(`${API_BASE_URL}/Booking/${id}`);
  return response.json();
};

export const getBookingbyuser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/Booking/user/${userId}/bookings`);
  return response.json();
};