"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";

export function useWallet() {
  const { data: session, update } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async (walletAddress: string) => {
    if (!session?.user?.id) {
      setError("User not authenticated");
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect wallet");
      }

      // Update the session with the new wallet address
      await update();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!session?.user) return false;

    setIsConnecting(true);
    setError(null);

    try {
      // Disconnect from wagmi first
      disconnect();

      // Update database
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: null }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect wallet");
      }

      await update();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect wallet"
      );
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto-sync when wallet connects
  useEffect(() => {
    if (isConnected && address && session?.user?.id) {
      // Only sync if the wallet address has changed
      if (address !== session.user.walletAddress) {
        const syncWallet = async () => {
          setIsConnecting(true);
          setError(null);

          try {
            const response = await fetch("/api/user/wallet", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ walletAddress: address }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to sync wallet");
            }

            // Update the session with the new wallet address
            await update();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Failed to sync wallet"
            );
          } finally {
            setIsConnecting(false);
          }
        };

        syncWallet();
      }
    }
  }, [
    isConnected,
    address,
    session?.user?.id,
    session?.user?.walletAddress,
    update,
  ]);

  // Clear error when wallet state changes
  useEffect(() => {
    setError(null);
  }, [isConnected, address]);

  return {
    walletAddress: session?.user?.walletAddress || address,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isWalletSynced: !!(
      session?.user?.walletAddress &&
      isConnected &&
      address === session.user.walletAddress
    ),
  };
}
