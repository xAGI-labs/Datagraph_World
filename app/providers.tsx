'use client';

import { base } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import type { ReactNode } from 'react';
import AuthProvider from '@/components/providers/session-provider';

// Create Wagmi config for OnchainKit wallets
const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'DataGraph',
      preference: 'smartWalletOnly',
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''}`),
  },
});

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
            config={{ appearance: { 
              mode: 'auto',
            }}}
          >
            {props.children}
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </AuthProvider>
  );
}

