"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { wagmiConfig } from "@/config/wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10_000,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          customTheme={{
            "--ck-font-family": "Inter, system-ui, sans-serif",
            "--ck-body-background": "#111111",
            "--ck-body-color": "#e5e5e5",
            "--ck-primary-button-background": "#22c55e",
            "--ck-primary-button-color": "#000000",
            "--ck-primary-button-hover-background": "#16a34a",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
