'use client';

import { useState } from 'react';
import { useVibePoints } from '@/hooks/use-vibe-points';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { 
  ConnectWallet,
  Wallet,
} from '@coinbase/onchainkit/wallet';

export default function VibeTrading() {
  const { data: session } = useSession();
  const { vibePoints, tradeVibePoints, isConnected } = useVibePoints();
  const [tradeAmount, setTradeAmount] = useState(100);
  const [isTrading, setIsTrading] = useState(false);

  // Conversion rate: 1000 Vibe Points = 0.001 ETH
  const conversionRate = 0.000001; // ETH per Vibe Point
  const estimatedETH = tradeAmount * conversionRate;
  const minTradeAmount = 100;

  const handleTrade = async () => {
    if (tradeAmount > vibePoints) {
      return;
    }

    if (tradeAmount < minTradeAmount) {
      return;
    }

    setIsTrading(true);
    
    try {
      const result = await tradeVibePoints(tradeAmount);
      
      if (result.success) {
        setTradeAmount(100); // Reset to minimum
      }
    } catch (error) {
      console.error('Trading error:', error);
    } finally {
      setIsTrading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Trade Vibe Points</h3>
        <p className="text-gray-600 mb-4">Sign in to trade vibe points for crypto</p>
        <Button onClick={() => signIn('google')} className="bg-orange-500 hover:bg-orange-600">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In with Google
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Trade Vibe Points</h3>
        <p className="text-gray-600 mb-4">Connect your wallet to trade vibe points for crypto</p>
        <Wallet>
          <ConnectWallet className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Connect Wallet
          </ConnectWallet>
        </Wallet>
      </div>
    );
  }

  const isDisabled = tradeAmount > vibePoints || tradeAmount < minTradeAmount || isTrading;

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Trade Vibe Points for ETH</h3>
      <p className="text-sm text-gray-600 mb-4">
        Your Vibe Points: <span className="font-bold text-purple-600">{vibePoints.toLocaleString()}</span>
      </p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Vibe Points to Trade (min: {minTradeAmount})
        </label>
        <input
          type="number"
          value={tradeAmount}
          onChange={(e) => setTradeAmount(Number(e.target.value))}
          max={vibePoints}
          min={minTradeAmount}
          step={100}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isTrading}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            ≈ {estimatedETH.toFixed(6)} ETH
          </p>
          <p className="text-xs text-gray-500">
            Rate: 1,000 VP = 0.001 ETH
          </p>
        </div>
      </div>

      <button
        onClick={handleTrade}
        disabled={isDisabled}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isTrading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Trading...
          </div>
        ) : (
          `Trade ${tradeAmount} VP for ${estimatedETH.toFixed(6)} ETH`
        )}
      </button>
      
      {tradeAmount > vibePoints && (
        <p className="text-xs text-red-500 mt-2 text-center">
          Insufficient vibe points
        </p>
      )}
      
      {tradeAmount < minTradeAmount && tradeAmount > 0 && (
        <p className="text-xs text-red-500 mt-2 text-center">
          Minimum trade amount is {minTradeAmount} VP
        </p>
      )}
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        🚀 Real ETH trading on Base network! Transactions are processed on-chain.
      </p>
    </div>
  );
}
