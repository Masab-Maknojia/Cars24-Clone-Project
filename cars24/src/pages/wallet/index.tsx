import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWalletDetails } from "@/lib/Walletapi";
import { Wallet, Copy, Check, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const WalletPage = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      if (user?.id) {
        try {
          const data = await getWalletDetails(user.id);
          setBalance(data.balance);
          setReferralCode(data.referralCode);
          const sortedHistory = (data.walletHistory || []).sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setHistory(sortedHistory);
        } catch (error) {
          console.error("Error loading wallet:", error);
          toast.error("Failed to load wallet details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWallet();
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Wallet...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Wallet className="w-8 h-8 text-orange-500" /> My Wallet
        </h1>

        {/* Top Section: Balance & Referral */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 shadow-lg">
            <p className="text-gray-400 text-sm font-medium mb-1">Total Balance</p>
            <div className="text-5xl font-bold mb-4">₹{balance.toLocaleString()}</div>
            <p className="text-sm text-gray-400">
              1 Point = ₹1. Use these points to get discounts on car purchases or services.
            </p>
          </div>

          {/* Referral Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Refer & Earn</h3>
            <p className="text-gray-500 text-sm mb-6">
              Share your code with friends. You both get <span className="font-bold text-orange-500">500 points</span> when they buy or sell a car for the first time!
            </p>
            
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg border border-gray-200 border-dashed">
              <span className="flex-1 font-mono text-lg font-bold tracking-wider text-gray-800 text-center">
                {referralCode || "Generating..."}
              </span>
              <button 
                onClick={copyToClipboard}
                className="p-2 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Transaction History</h3>
          </div>
          
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions yet. Refer a friend to get started!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((txn, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${txn.type === "Credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {txn.type === "Credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{txn.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(txn.date).toLocaleDateString()} • {new Date(txn.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${txn.type === "Credit" ? "text-green-600" : "text-gray-900"}`}>
                    {txn.type === "Credit" ? "+" : "-"} {txn.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default WalletPage;