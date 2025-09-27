"use client";

import { useState, useEffect } from "react";
import { useWallet } from "./use-wallet";

export function useWalletBalance() {
  const { walletAddress, isConnected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wallet/balance?address=${address}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch balance");
      }

      setBalance(data.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = () => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    }
  };

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchBalance(walletAddress);
    } else {
      setBalance(null);
      setError(null);
    }
  }, [isConnected, walletAddress]);

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    hasWallet: !!walletAddress,
  };
}
