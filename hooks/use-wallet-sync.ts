"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";

/**
 * Custom hook to automatically sync wallet address to user profile
 * when wallet is connected and user is authenticated
 */
export const useWalletSync = () => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Only sync if user is authenticated and wallet is connected
    const sessionUser = session?.user as any; // Type assertion for session user with id
    if (!sessionUser?.id || !isConnected || !address) {
      console.log("Wallet sync conditions not met:", {
        hasSession: !!sessionUser?.id,
        isConnected,
        hasAddress: !!address,
        userId: sessionUser?.id,
      });
      return;
    }

    const syncWalletAddress = async () => {
      try {
        console.log("Starting wallet address sync:", {
          address,
          userId: sessionUser.id,
          userEmail: sessionUser.email,
        });

        const response = await fetch("/api/user/wallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: address,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Wallet address synced successfully:", data);
        } else {
          console.error("Failed to sync wallet address:", {
            status: response.status,
            error: data.error,
            data,
          });
        }
      } catch (error) {
        console.error("Error syncing wallet address:", error);
      }
    };

    // Add a small delay to ensure the wallet connection is fully established
    const timeoutId = setTimeout(syncWalletAddress, 500);

    return () => clearTimeout(timeoutId);
  }, [session, isConnected, address]);

  return {
    isWalletSynced: session && isConnected && address,
    walletAddress: address,
    isConnected,
  };
};
