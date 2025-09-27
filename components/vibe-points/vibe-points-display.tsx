'use client';

import { useVibePoints } from '@/hooks/use-vibe-points';
import { useAccount } from 'wagmi';
import { useSession, signIn } from 'next-auth/react';
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function VibePointsDisplay() {
  const { data: session } = useSession();
  const { vibePoints, loading, isConnected, walletAddress } = useVibePoints();
  
  // Additional debug with wagmi directly
  const wagmiAccount = useAccount();

  // Debug logging
  console.log('VibePointsDisplay Debug:', {
    isConnected,
    walletAddress,
    vibePoints,
    loading,
    wagmiDebug: {
      isConnected: wagmiAccount.isConnected,
      address: wagmiAccount.address,
      status: wagmiAccount.status,
    }
  });

  if (!session) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border">
        <span className="text-sm text-gray-600">Sign in to see Vibe Points</span>
        <Button 
          onClick={() => signIn('google')}
          size="sm"
          variant="outline"
        >
          <LogIn className="w-4 h-4 mr-1" />
          Sign In
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border">
        <span className="text-sm text-black">Connect wallet to see Vibe Points</span>
        <Wallet>
          <ConnectWallet className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors">
            Connect
          </ConnectWallet>
        </Wallet>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border">
      <span className="text-2xl">✨</span>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700">Vibe Points</div>
        <div className="text-xl font-bold text-purple-600">
          {loading ? '...' : vibePoints.toLocaleString()}
        </div>
        {/* Debug info */}
        <div className="text-xs text-gray-500 mt-1">
          Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
        </div>
      </div>
      
      {/* Wallet dropdown for connected state */}
      <Wallet>
        <WalletDropdown>
          <WalletDropdownBasename />
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
