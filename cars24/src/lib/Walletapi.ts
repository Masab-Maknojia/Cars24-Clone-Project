const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api";

export const getWalletDetails = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/Wallet/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wallet details");
  }

  return await response.json();
};

export const creditWallet = async (userId: string, amount: number, description: string) => {
  const response = await fetch(`${API_BASE_URL}/Wallet/credit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, amount, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to credit wallet");
  }

  return await response.json();
};

export const debitWallet = async (userId: string, amount: number, description: string) => {
  const response = await fetch(`${API_BASE_URL}/Wallet/debit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, amount, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to debit wallet");
  }

  return await response.json();
};

export const triggerReferralBonus = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/Wallet/trigger-referral/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!response.ok) {
    throw new Error("Failed to trigger referral bonus");
  }

  return await response.json();
};