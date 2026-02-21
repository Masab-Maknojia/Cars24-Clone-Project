import React, { useState, useEffect } from "react";
import { Bell, Calendar, Car, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { updateUserPreferences } from "@/lib/userapi";
import { toast } from "sonner";

const ProfilePage = () => {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth() as any;
  const [loading, setLoading] = useState(false);
  
  const [prefs, setPrefs] = useState({
    appointments: true,
    priceDrops: true,
    bidUpdates: true,
    newMessages: false,
  });

  useEffect(() => {
    if (user && (user as any).preferences) {
      setPrefs((user as any).preferences);
    }
  }, [user]);

  const togglePreference = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestNotification = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support desktop notifications.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      try {
        if ("serviceWorker" in navigator) {
          let registration = await navigator.serviceWorker.getRegistration("/");
          if (!registration) {
            registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
          }
          
          if (registration) {
            await navigator.serviceWorker.ready;
            await registration.showNotification("Test Notification", {
              body: "If you see this, your System Notifications are working!",
              icon: "/favicon.ico",
            });
            toast.success("Test sent via Service Worker!");
            return;
          }
        }

        new Notification("Test Notification", {
          body: "If you see this, your System Notifications are working!",
          icon: "/favicon.ico",
        });
        toast.success("Test sent! Check your taskbar/notification center.");

      } catch (e: any) {
        console.error("Notification Error:", e);
        toast.error("Failed to create notification. Check Console.");
      }
    } else {
      toast.error("Permission denied. Reset browser permissions.");
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await updateUserPreferences(user.id, prefs);
      
      if (user) {
        const updatedUser = { ...user, preferences: prefs };
        
        if (typeof updateUser === "function") {
          updateUser(updatedUser);
        }
        
        const storedUser = localStorage.getItem("cars24_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.preferences = prefs;
          localStorage.setItem("cars24_user", JSON.stringify(parsedUser));
        }
      }

      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>
                  <p className="text-blue-100">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Settings Column */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h2 className="text-lg font-semibold flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-blue-600" />
                        Notification Preferences
                      </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {Object.entries(prefs).map(([key, value]) => (
                        <div key={key} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div>
                            <p className="font-medium capitalize text-gray-900">
                              {key.replace(/([A-Z])/g, " $1")}
                            </p>
                          </div>
                          <button
                            onClick={() => togglePreference(key as any)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? "bg-blue-600" : "bg-gray-200"
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? "translate-x-6" : "translate-x-1"
                              }`} 
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gray-50 text-right space-x-3">
                      {/* Test Button */}
                      <button
                        onClick={handleTestNotification}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Enable / Test Push
                      </button>

                      <button
                        onClick={handleSavePreferences}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Column */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Quick Actions</h2>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-gray-50">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span>Account Settings</span>
                    </button>
                    <button onClick={() => router.push("/appointments")} className="w-full flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-gray-50">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>Appointments</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-red-50 text-red-600">
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;