/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Car, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getappointmentbyuser } from "@/lib/Appointmentapi";

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "upcoming": return "bg-blue-500 text-white";
      case "completed": return "bg-green-500 text-white";
      case "cancelled": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user?.id) {
          const data = await getappointmentbyuser(user.id);
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

          <div className="space-y-4">
            {appointments.map((appointment: any) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`px-4 py-2 ${getStatusBadgeColor(appointment.status)}`}>
                  <span className="text-white text-sm font-medium capitalize">
                    {appointment.status || "Upcoming"}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Car className="w-5 h-5 mr-2 text-gray-500" />
                        Car ID: {appointment.carId}
                      </h3>

                      <div className="mt-4 space-y-2">
                        <p className="text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Date: {appointment.date}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Time: {appointment.time}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Location: {appointment.location}
                        </p>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-700">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {appointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Appointments</h3>
              <p className="text-gray-600 mt-2">You haven't scheduled any inspections yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppointmentsPage;