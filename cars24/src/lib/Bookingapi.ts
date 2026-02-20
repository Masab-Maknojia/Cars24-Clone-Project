//const BASE_URL = "http://localhost:5203/api/Booking";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api/Booking";

export const createBooking = async (userid: string, Booking: any) => {
  const response = await fetch(`${API_BASE_URL}?userId=${userid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Booking),
  });
  return response.json();
};

export const getBookingbyid = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  return response.json();
};
export const getBookingbyuser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/bookings`);
  return response.json();
};
