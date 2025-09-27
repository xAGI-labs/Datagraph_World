'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, useConnect, useDisconnect } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  DollarSign,
  Wallet,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface TradingRates {
  ethToVp: number;
  vpToEth: number;
  minEthAmount: number;
  minVpAmount: number;
}

interface TradeResult {
  success: boolean;
  message: string;
  transaction: {
    type: 'buy' | 'sell';
    vpAmount: number;
    ethAmount: number;
    newBalance: number;
    transactionId: string;
    usdValue: number;
  };
}

export const EthVibeTrading = () => {
  const { data: session, update: updateSession } = useSession();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [tradingRates, setTradingRates] = useState<TradingRates | null>(null);
  const [buyAmount, setBuyAmount] = useState('0.001');
  const [sellAmount, setSellAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(false);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onchainKitAddress, setOnchainKitAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (address && isConnected) {
        setOnchainKitAddress(address);
        return;
      }

      if (typeof window !== 'undefined') {
        try {
          const ethereum = (window as any).ethereum;
          if (ethereum) {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setOnchainKitAddress(accounts[0]);
              return;
            }
          }
        } catch (error) {
          console.log('Failed to check ethereum provider:', error);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length > 0) {
            setOnchainKitAddress(accounts[0]);
          } else {
            setOnchainKitAddress(null);
          }
        };

        ethereum.on?.('accountsChanged', handleAccountsChanged);
        return () => {
          ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        };
      }
    }
  }, [address, isConnected]);

  // Determine if we have any wallet connected (wagmi or OnchainKit)
  const hasWalletConnected = isConnected || !!onchainKitAddress;
  const currentAddress = address || onchainKitAddress;

  // Transaction handling
  const { sendTransaction, data: txHash, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Auto-sync detected wallet address
  useEffect(() => {
    if (onchainKitAddress && session?.user && onchainKitAddress !== session.user.walletAddress) {
      const syncWallet = async () => {
        try {
          console.log('Auto-syncing detected wallet:', onchainKitAddress);
          const response = await fetch('/api/user/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: onchainKitAddress }),
          });
          
          if (response.ok) {
            console.log('Wallet synced successfully');
            // Update session instead of reloading
            await updateSession();
          }
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      };
      
      syncWallet();
    }
  }, [onchainKitAddress, session?.user, updateSession]);

  // Fetch trading rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('/api/vibe-points/trade-eth');
        const data = await response.json();
        if (data.success) {
          setTradingRates(data.rates);
        }
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };

    fetchRates();
  }, []);

  // Handle transaction confirmation
  const updateTradeWithTxHash = useCallback(async (txHash: string, type: 'buy' | 'sell') => {
    try {
      const amount = type === 'buy' ? parseFloat(buyAmount) : parseInt(sellAmount);
      
      await fetch('/api/vibe-points/trade-eth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type,
          amount,
          transactionHash: txHash,
        }),
      });

      // Update session to reflect new vibe points
      await updateSession();
    } catch (error) {
      console.error('Error updating trade with tx hash:', error);
    }
  }, [buyAmount, sellAmount, updateSession]);

  useEffect(() => {
    if (isConfirmed && txHash && tradeResult) {
      // Update the database with the confirmed transaction
      updateTradeWithTxHash(txHash, tradeResult.transaction.type);
    }
  }, [isConfirmed, txHash, tradeResult, updateTradeWithTxHash]);

  const handleBuyVibePoints = async () => {
    if (!isConnected || !address || !tradingRates) return;

    setIsLoading(true);
    setError(null);
    setTradeResult(null);

    try {
      const ethAmount = parseFloat(buyAmount);
      
      if (ethAmount < tradingRates.minEthAmount) {
        throw new Error(`Minimum purchase amount is ${tradingRates.minEthAmount} ETH`);
      }

      // Send ETH transaction first
      const recipientAddress = process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x742d35Cc6644C0532925a3b8D39d7A2C6B4b85e9';
      
      sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseEther(buyAmount),
      });

      // The actual VP credit will happen in useEffect when transaction confirms
      
    } catch (error) {
      console.error('Buy transaction error:', error);
      setError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellVibePoints = async () => {
    if (!session?.user?.id || !tradingRates) return;

    setIsLoading(true);
    setError(null);
    setTradeResult(null);

    try {
      const vpAmount = parseInt(sellAmount);
      
      if (vpAmount < tradingRates.minVpAmount) {
        throw new Error(`Minimum sell amount is ${tradingRates.minVpAmount} VP`);
      }

      if (!session?.user?.vibePoints || session.user.vibePoints < vpAmount) {
        throw new Error('Insufficient vibe points');
      }

      const response = await fetch('/api/vibe-points/trade-eth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sell',
          amount: vpAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sell transaction failed');
      }

      setTradeResult(data);
      await updateSession();
      
    } catch (error) {
      console.error('Sell transaction error:', error);
      setError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasWalletConnected) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ETH ⟷ Vibe Points Trading
          </h3>
          <p className="text-gray-600 mb-6">Connect your wallet to start trading</p>
          
        </div>
      </Card>
    );
  }

  const ethBalance = balance ? parseFloat(formatEther(balance.value)) : 0;
  const vpBalance = session?.user?.vibePoints || 0;
  const estimatedVP = tradingRates ? parseFloat(buyAmount) * tradingRates.ethToVp : 0;
  const estimatedETH = tradingRates ? parseInt(sellAmount) * tradingRates.vpToEth : 0;

  return (
    <div className="space-y-6">
      {/* Main Trading Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-xl">
              <ArrowUpDown className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Cash Out Points</h2>
              <p className="text-gray-600">Convert your Vibe Points to ETH</p>
            </div>
          </div>
          <div className="text-right bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 rounded-xl">
            <p className="text-sm text-gray-600">Current Rate</p>
            <p className="font-bold text-lg text-gray-900">
              {tradingRates?.minVpAmount || 100} VP = {tradingRates?.vpToEth.toFixed(6) || 'Loading...'} ETH
            </p>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">ETH Balance</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{ethBalance.toFixed(6)} ETH</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Vibe Points</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{vpBalance.toLocaleString()} VP</span>
            </div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Trade Your Points</h3>
            <p className="text-gray-600">Convert Vibe Points to ETH instantly</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200/50">
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Vibe Points to Trade (min: {tradingRates?.minVpAmount || 100})
              </label>
              <div className="space-y-4">
                <input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  step="100"
                  min={tradingRates?.minVpAmount || 100}
                  max={vpBalance}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-lg font-medium"
                  disabled={isLoading}
                  placeholder="Enter amount..."
                />
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200/50">
                  <div>
                    <p className="text-sm text-gray-600">You'll receive</p>
                    <p className="text-xl font-bold text-gray-900">{estimatedETH.toFixed(6)} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Estimated USD</p>
                    <p className="text-lg font-semibold text-green-600">${(estimatedETH * 2400).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSellVibePoints}
              disabled={isLoading || parseInt(sellAmount) > vpBalance || parseInt(sellAmount) < (tradingRates?.minVpAmount || 100)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Trade...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Trade {sellAmount} VP → Get {estimatedETH.toFixed(6)} ETH
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 text-red-700">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold">Transaction Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {tradeResult && (
        <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 text-green-700">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Trade Successful!</p>
              <p className="text-sm text-green-600">{tradeResult.message}</p>
              <div className="mt-2 text-sm text-gray-600">
                <p>New Vibe Points Balance: {tradeResult.transaction.newBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {txHash && (
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-blue-700">
              <div className="bg-blue-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Transaction Submitted</p>
                <p className="text-sm text-blue-600">Your trade is being processed</p>
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-sm text-gray-600 font-mono">
                Hash: {txHash?.slice(0, 10)}...{txHash?.slice(-8)}
              </p>
              {isConfirmed && (
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600 font-medium">Transaction Confirmed!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
