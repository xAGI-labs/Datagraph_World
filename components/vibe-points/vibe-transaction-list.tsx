'use client';

import { useVibePoints } from '@/hooks/use-vibe-points';

interface VibeTransactionListProps {
  limit?: number;
}

export default function VibeTransactionList({ limit }: VibeTransactionListProps) {
  const { recentTransactions, loading } = useVibePoints();

  if (loading) {
    return (
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayedTransactions = limit ? recentTransactions.slice(0, limit) : recentTransactions;

  return (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        {recentTransactions.length > 0 && (
          <span className="text-sm text-gray-500">
            {displayedTransactions.length} of {recentTransactions.length}
          </span>
        )}
      </div>
      
      {displayedTransactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Complete annotations to earn vibe points
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayedTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className={`p-4 rounded-lg border-l-4 ${
                transaction.type === 'EARNED' ? 'border-l-green-500 bg-green-50' : 
                transaction.type === 'TRADED' ? 'border-l-blue-500 bg-blue-50' : 
                'border-l-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-lg font-bold ${
                      transaction.type === 'EARNED' ? 'text-green-600' : 
                      transaction.type === 'TRADED' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'EARNED' ? '+' : ''}
                      {transaction.amount.toLocaleString()} VP
                    </span>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'EARNED' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'TRADED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                    
                    {transaction.blockchainTx && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        🔗 On-chain
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-1">
                    {transaction.description}
                  </p>
                  
                  {transaction.cryptoAmount && transaction.cryptoSymbol && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        → {transaction.cryptoAmount} {transaction.cryptoSymbol}
                      </span>
                      <span className="text-xs text-gray-500">
                        (Rate: {(transaction.cryptoAmount / Math.abs(transaction.amount)).toFixed(8)} {transaction.cryptoSymbol}/VP)
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                
                {transaction.txHash && (
                  <div className="ml-4">
                    <a
                      href={`https://basescan.org/tx/${transaction.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition-colors"
                    >
                      <span>View on BaseScan</span>
                      <span>↗</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
