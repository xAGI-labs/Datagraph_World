'use client';

import { useWallet } from '@/hooks/use-wallet';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';

interface WalletConnectWithSyncProps {
  className?: string;
  children?: React.ReactNode;
}

export const WalletConnectWithSync = ({ className, children }: WalletConnectWithSyncProps) => {
  const { error, isConnecting, isWalletSynced } = useWallet();
  const { address } = useAccount();

  return (
    <>
      {error && (
        <div className="mb-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {isConnecting && (
        <div className="mb-2 p-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded">
          Syncing wallet with your account...
        </div>
      )}
      
      {isWalletSynced && address && (
        <div className="mb-2 p-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
          Wallet synced: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}
      
      <ConnectWallet className={className}>
        {children}
      </ConnectWallet>
    </>
  );
};
