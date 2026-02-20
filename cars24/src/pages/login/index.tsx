import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Gift } from "lucide-react";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [referralCode, setReferralCode] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Welcome back!");
        router.push("/");
      } else {
        const response = await fetch("http://localhost:5203/api/UserAuth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            password,
            referredBy: referralCode || "" 
          }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Signup failed");
        }

        toast.success("Account created! Please log in.");
        setIsLogin(true); 
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-500">
            {isLogin ? "Enter your details to sign in" : "Sign up to start your journey"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <Input
                type="text"
                required
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-gray-900 font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-gray-900 font-medium"
            />
          </div>

          {!isLogin && (
            <div className="pt-2">
               <div className="flex items-center gap-2 mb-1">
                 <Gift className="w-3 h-3 text-orange-500" />
                 <label className="block text-xs font-medium text-gray-600">Referral Code (Optional)</label>
               </div>
              <Input
                type="text"
                placeholder="Ex: REF-A1B2"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-orange-50 border-orange-200 focus:border-orange-500 text-gray-900 font-medium" // 👈 Added explicit text color
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Enter a friend's code to earn 500 bonus points!
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 mt-4"
            disabled={loading}
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="text-orange-500 font-bold hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;