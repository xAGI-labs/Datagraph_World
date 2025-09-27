'use client';

import { useSession } from 'next-auth/react';
import { useAccount } from 'wagmi';
import { useWallet } from '@/hooks/use-wallet';
import { Card } from '@/components/ui/card';

export const WalletDebugInfo = () => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { walletAddress, isWalletSynced, isConnecting, error } = useWallet();

  return (
    <Card className="p-4 bg-gray-50 border-dashed">
      <h4 className="font-medium mb-3 text-gray-700">🔧 Wallet Debug Info</h4>
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-600">Session User ID:</span>
          <span className="font-mono text-xs">{session?.user?.id || 'None'}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-600">Wagmi Connected:</span>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-600">Wagmi Address:</span>
          <span className="font-mono text-xs">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-600">DB Wallet Address:</span>
          <span className="font-mono text-xs">
            {session?.user?.walletAddress ? `${session.user.walletAddress.slice(0, 6)}...${session.user.walletAddress.slice(-4)}` : 'None'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-600">Sync Status:</span>
          <span className={isWalletSynced ? 'text-green-600' : 'text-yellow-600'}>
            {isWalletSynced ? '✅ Synced' : '⏳ Not synced'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-600">Is Connecting:</span>
          <span className={isConnecting ? 'text-blue-600' : 'text-gray-500'}>
            {isConnecting ? '🔄 Yes' : 'No'}
          </span>
        </div>
        
        {error && (
          <div className="col-span-2 p-2 bg-red-100 border border-red-200 rounded text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-600">Vibe Points:</span>
          <span className="font-medium text-purple-600">
            {session?.user?.vibePoints?.toLocaleString() || '0'}
          </span>
        </div>
      </div>
    </Card>
  );
};
