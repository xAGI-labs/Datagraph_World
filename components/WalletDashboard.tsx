'use client';

import { useSession } from 'next-auth/react';
import { WalletConnectWithSync } from '@/components/WalletConnectWithSync';
import { WalletInfo } from '@/components/WalletInfo';
import { useWallet } from '@/hooks/use-wallet';

export const WalletDashboard = () => {
  const { data: session } = useSession();
  const { isWalletSynced, walletAddress } = useWallet();

  if (!session?.user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Please sign in to manage your wallet</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Wallet Management</h2>
      
      <div className="space-y-4">
        {/* Wallet Connection */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Connect Wallet</h3>
          <WalletConnectWithSync className="w-full">
            Connect Wallet
          </WalletConnectWithSync>
        </div>

        {/* Wallet Info */}
        {walletAddress && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Wallet Details</h3>
            <WalletInfo showBalance={true} className="p-4 bg-gray-50 rounded-lg" />
          </div>
        )}

        {/* Sync Status */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Sync Status</h3>
          <p className="text-sm text-blue-600">
            {isWalletSynced 
              ? '✅ Your wallet is synced with your account' 
              : '⏳ Wallet not synced or disconnected'}
          </p>
        </div>

        {/* User Profile Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Account Info</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Email:</span> {session.user.email}</p>
            <p><span className="font-medium">Name:</span> {session.user.name || 'Not set'}</p>
            <p><span className="font-medium">Vibe Points:</span> {session.user.vibePoints?.toLocaleString() || 0}</p>
            <p><span className="font-medium">Onboarded:</span> {session.user.hasOnboarded ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
