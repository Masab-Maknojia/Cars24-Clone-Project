import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

interface User {
  id: string;
  fullName: string;
  email: string;
  referralCode?: string;
  walletBalance?: number;
  // Add other fields as needed
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>; 
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("cars24_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data");
        localStorage.removeItem("cars24_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api";

    try {
      const response = await fetch(`${API_BASE_URL}/UserAuth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const userData = await response.json();

      setUser(userData);
      localStorage.setItem("cars24_user", JSON.stringify(userData));
      
    } catch (error: any) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cars24_user");
    router.push("/login");
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};