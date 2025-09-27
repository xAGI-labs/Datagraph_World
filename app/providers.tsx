'use client';

import type { ReactNode } from 'react';
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorldAuthProvider } from '@/hooks/use-world-auth';

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MiniKitProvider 
        props={{
          appId: process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`,
        }}
      >
        <WorldAuthProvider>
          {props.children}
        </WorldAuthProvider>
      </MiniKitProvider>
    </QueryClientProvider>
  );
}

