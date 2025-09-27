import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface VibeTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  txHash: string | null;
  blockchainTx: boolean;
  cryptoAmount: number | null;
  cryptoSymbol: string | null;
  createdAt: string;
}

interface UseVibePointsReturn {
  vibePoints: number;
  loading: boolean;
  recentTransactions: VibeTransaction[];
  awardVibePoints: (points: number, description?: string) => Promise<boolean>;
  tradeVibePoints: (
    points: number,
    cryptoSymbol?: string
  ) => Promise<{
    success: boolean;
    txHash?: string;
    blockExplorer?: string;
    cryptoAmount?: number;
  }>;
  refetch: () => Promise<void>;
  isConnected: boolean;
  walletAddress: string | undefined;
}

export function useVibePoints(): UseVibePointsReturn {
  const [vibePoints, setVibePoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<
    VibeTransaction[]
  >([]);

  // Use wagmi for wallet connection and NextAuth for user session
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();

  // Load vibe points when wallet connects
  const fetchVibePoints = useCallback(async () => {
    if (!address) {
      console.log("Hook Debug - No wallet address from wagmi");
      return;
    }

    console.log(
      "Hook Debug - Fetching vibe points for OnchainKit wallet:",
      address
    );
    setLoading(true);

    try {
      const response = await fetch(`/api/vibe-points/${address}`);
      const data = await response.json();

      console.log("Hook Debug - API response:", {
        status: response.status,
        data,
      });

      if (response.ok) {
        setVibePoints(data.points || 0);
        setRecentTransactions(data.recentTransactions || []);
        console.log("Hook Debug - Set vibe points to:", data.points);
      } else {
        console.error("Failed to fetch vibe points:", data.error);
        console.log("Hook Debug - API error response:", data);
      }
    } catch (error) {
      console.error("Failed to fetch vibe points:", error);
      toast.error("Failed to load vibe points");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address && isConnected) {
      fetchVibePoints();
    } else {
      setVibePoints(0);
      setRecentTransactions([]);
    }
  }, [address, isConnected, fetchVibePoints]);

  const awardVibePoints = async (
    points: number,
    description?: string
  ): Promise<boolean> => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return false;
    }

    try {
      const response = await fetch("/api/vibe-points/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          points,
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVibePoints(data.totalPoints);
        toast.success(`🎉 You earned ${points} Vibe Points!`);
        // Refresh to get updated transactions
        await fetchVibePoints();
        return true;
      } else {
        toast.error(data.error || "Failed to award points");
        return false;
      }
    } catch (error) {
      console.error("Failed to award vibe points:", error);
      toast.error("Failed to award points");
      return false;
    }
  };

  const tradeVibePoints = async (
    points: number,
    cryptoSymbol: string = "ETH"
  ): Promise<{
    success: boolean;
    txHash?: string;
    blockExplorer?: string;
    cryptoAmount?: number;
  }> => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return { success: false };
    }

    if (points > vibePoints) {
      toast.error("Insufficient vibe points");
      return { success: false };
    }

    // Show loading toast
    const loadingToast = toast.loading("Processing trade...");

    try {
      const response = await fetch("/api/vibe-points/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          vibePoints: points,
          cryptoSymbol,
        }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (response.ok) {
        setVibePoints(data.remainingVibePoints);
        toast.success(
          `🎉 Trade successful! ${points} VP → ${data.cryptoAmount} ${data.cryptoSymbol}`
        );

        // Refresh to get updated transactions
        await fetchVibePoints();

        return {
          success: true,
          txHash: data.txHash,
          blockExplorer: data.blockExplorer,
          cryptoAmount: data.cryptoAmount,
        };
      } else {
        toast.error(data.error || "Failed to process trade");
        return { success: false };
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Failed to trade vibe points:", error);
      toast.error("Failed to process trade");
      return { success: false };
    }
  };

  return {
    vibePoints,
    loading,
    recentTransactions,
    awardVibePoints,
    tradeVibePoints,
    refetch: fetchVibePoints,
    isConnected: isConnected && !!address,
    walletAddress: address,
  };
}
