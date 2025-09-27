'use client';

import { useWallet } from '@/hooks/use-wallet';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { useSession } from 'next-auth/react';
import { useAccount } from 'wagmi';

interface WalletInfoProps {
  className?: string;
  showBalance?: boolean;
}

export const WalletInfo = ({ className, showBalance = false }: WalletInfoProps) => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { isWalletSynced, disconnectWallet, isConnecting } = useWallet();
  const { balance, isLoading: balanceLoading, error: balanceError, refreshBalance } = useWalletBalance();

  if (!session?.user) {
    return null;
  }

  const walletAddress = session.user.walletAddress || address;

  return (
    <div className={`wallet-info ${className || ''}`}>
      {isConnected && walletAddress ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <div className="flex items-center space-x-2">
              {isWalletSynced ? (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  ✓ Synced
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  ⏳ Syncing...
                </span>
              )}
            </div>
          </div>

          {showBalance && (
            <div className="text-sm">
              {balanceLoading ? (
                <span className="text-gray-500">Loading balance...</span>
              ) : balanceError ? (
                <div className="flex items-center space-x-1">
                  <span className="text-red-500">Balance error</span>
                  <button
                    onClick={refreshBalance}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Retry
                  </button>
                </div>
              ) : balance !== null ? (
                <span className="text-gray-700">
                  Balance: {balance.toFixed(4)} ETH
                </span>
              ) : null}
            </div>
          )}

          {session.user.vibePoints !== undefined && (
            <div className="text-sm text-purple-600">
              Vibe Points: {session.user.vibePoints.toLocaleString()}
            </div>
          )}
          
          <button
            onClick={disconnectWallet}
            disabled={isConnecting}
            className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {isConnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          No wallet connected
        </div>
      )}
    </div>
  );
};
