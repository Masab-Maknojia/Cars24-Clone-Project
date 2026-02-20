import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

type Coordinates = {
  lat: number;
  lng: number;
};

interface LocationContextType {
  city: string;
  coordinates: Coordinates | null;
  loading: boolean;
  detectLocation: () => Promise<void>;
  updateCity: (city: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [city, setCity] = useState<string>(""); 
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCity = localStorage.getItem("user_city");
    if (savedCity) {
      setCity(savedCity);
    }
  }, []);

  const updateCity = (newCity: string) => {
    setCity(newCity);
    localStorage.setItem("user_city", newCity);
    toast.success(`Location updated to ${newCity}`);
    setCoordinates(null);
  };

  const detectLocation = async () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) throw new Error("Failed to fetch location data");

          const data = await response.json();
          
          const detectedCity = 
            data.address.city || 
            data.address.town || 
            data.address.village || 
            data.address.state_district || 
            "Unknown Location";

          const cleanCity = detectedCity.split(" ")[0]; 

          setCity(cleanCity);
          localStorage.setItem("user_city", cleanCity);
          toast.success(`Location detected: ${cleanCity}`);
        } catch (error) {
          console.error("Failed to reverse geocode", error);
          toast.error("Could not determine city name. Please select manually.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        
        let msg = "Unable to retrieve your location.";
        if (error.code === 1) msg = "Location permission denied.";
        if (error.code === 2) msg = "Location unavailable.";
        if (error.code === 3) msg = "Location request timed out.";
        
        toast.error(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <LocationContext.Provider value={{ city, coordinates, loading, detectLocation, updateCity }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};