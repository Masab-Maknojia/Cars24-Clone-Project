/* eslint-disable @typescript-eslint/no-explicit-any */
//const BASE_URL = "http://localhost:5203/api/Appointment";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api";

export const createAppointment = async (userid: string, appointment: any) => {
  const response = await fetch(`${API_BASE_URL}/Appointment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointment),
  });
  if (!response.ok) throw new Error("Failed to create appointment");
  return response.json();
};

export const getAppointmentbyid = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/Appointment/${id}`);
  return response.json();
};

export const getappointmentbyuser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/Appointment/user/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user appointments");
  return response.json();
};