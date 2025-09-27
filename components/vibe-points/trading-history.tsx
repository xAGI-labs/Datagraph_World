'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ExternalLink,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface Trade {
  id: string;
  vibePointsTraded: number;
  cryptoSymbol: string;
  cryptoAmount: number;
  exchangeRate: number;
  usdValue: number;
  transactionHash: string | null;
  status: string;
  createdAt: string;
}

interface VibeTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  txHash: string | null;
  blockchainTx: boolean;
  cryptoAmount: number | null;
  cryptoSymbol: string | null;
  exchangeRate: number | null;
  createdAt: string;
}

interface TradingHistoryData {
  trades: Trade[];
  vibeTransactions: VibeTransaction[];
  summary: {
    totalTrades: number;
    totalVibePointsTraded: number;
    totalEthTraded: number;
    totalUsdValue: number;
  };
}

export const TradingHistory = () => {
  const { data: session } = useSession();
  const [data, setData] = useState<TradingHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTradingHistory = useCallback(async (isRefresh = false) => {
    if (!session?.user) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/vibe-points/trading-history');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch trading history');
      }

      setData(result.data);
    } catch (error) {
      console.error('Error fetching trading history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load trading history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user]);

  // Only fetch on initial load
  useEffect(() => {
    if (session?.user && !data) {
      fetchTradingHistory();
    }
  }, [session?.user, data, fetchTradingHistory]);

  const handleRefresh = () => {
    fetchTradingHistory(true);
  };

  if (!session) {
    return null;
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        {/* Summary Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trading History Skeleton */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <Button variant="outline" size="sm" disabled className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2 " />
              Loading...
            </Button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <div className="animate-pulse">Loading your trading history...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-lg">
        <div className="text-center space-y-4">
          <p className="text-red-700 font-medium">{error}</p>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="rounded-xl bg-white border-gray-300 hover:bg-gray-50 text-gray-700">
            {refreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTradeType = (vibePointsTraded: number) => {
    return vibePointsTraded > 0 ? 'sell' : 'buy';
  };

  const getBlockExplorerUrl = (txHash: string) => {
    return `https://basescan.org/tx/${txHash}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalTrades}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">VP Traded</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalVibePointsTraded.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">ETH Traded</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalEthTraded.toFixed(6)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">USD Value</p>
              <p className="text-2xl font-bold text-gray-900">${data.summary.totalUsdValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trading History */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing} className="rounded-xl bg-white border-gray-300 hover:bg-gray-50 text-gray-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {data.trades.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No trading history yet</h4>
            <p className="text-gray-600">Start trading to see your transaction history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.trades.map((trade) => {
              const tradeType = getTradeType(trade.vibePointsTraded);
              const vpAmount = Math.abs(trade.vibePointsTraded);
              
              return (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-xl border border-gray-200/50 hover:bg-white/60 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      tradeType === 'buy' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {tradeType === 'buy' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        {tradeType === 'buy' ? 'Bought' : 'Sold'} {vpAmount.toLocaleString()} VP
                      </p>
                      <p className="text-sm text-gray-600">
                        {tradeType === 'buy' ? 'for' : 'to'} {trade.cryptoAmount.toFixed(6)} {trade.cryptoSymbol}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(trade.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-medium text-gray-900">${trade.usdValue?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500">
                      Rate: {trade.exchangeRate.toFixed(8)}
                    </p>
                    <div className="flex items-center justify-end space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                        trade.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : trade.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.status}
                      </span>
                      {trade.transactionHash && (
                        <a
                          href={getBlockExplorerUrl(trade.transactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
