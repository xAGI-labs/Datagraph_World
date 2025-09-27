"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { EthVibeTrading } from '@/components/vibe-points/eth-vibe-trading';
import { TradingHistory } from '@/components/vibe-points/trading-history';
import VibePointsDashboard from '@/components/vibe-points/vibe-points-dashboard';
import { useWalletSync } from "@/hooks/use-wallet-sync"
import { Button } from '@/components/ui/button';
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import { 
  Coins, 
  Wallet as WalletIcon, 
  TrendingDown, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function PointsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  
  // Use the wallet sync hook to automatically store wallet addresses
  const { isWalletSynced, walletAddress } = useWalletSync()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      {/* Background gradient matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-bl from-amber-50 via-gray-50 to-orange-100/40" />

      {/* Header */}
      <div className="relative z-10">
        <header className="pt-6 pb-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              {session && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {session.user.vibePoints?.toLocaleString() || 0} VP
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 space-y-8 relative z-10">
          
          {/* Wallet Connection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-lg">
              {!isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  </div>
                  
                  <Wallet>
                    <ConnectWallet className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105">
                      Connect Coinbase Wallet
                    </ConnectWallet>
                  </Wallet>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Connected Address</p>
                      <p className="font-mono text-sm bg-white px-3 py-1 rounded border">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                      {isWalletSynced && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">Synced with account</span>
                        </div>
                      )}
                    </div>
                    <Wallet>
                      <WalletDropdown>
                        <WalletDropdownLink
                          icon="wallet"
                          href={`https://basescan.org/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Basescan
                        </WalletDropdownLink>
                        <WalletDropdownDisconnect />
                      </WalletDropdown>
                    </Wallet>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Trading Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <EthVibeTrading />
          </motion.div>

          {/* Trading History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pb-12"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Trading History</h2>
            </div>
            <TradingHistory />
          </motion.div>
        </div>
      </div>
    </div>
  );
}