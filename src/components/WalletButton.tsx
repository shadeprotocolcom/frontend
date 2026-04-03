"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-lg border border-shade-border bg-shade-surface px-3 py-1.5 text-sm text-shade-text hover:bg-shade-border/50 transition-colors"
      >
        {address.slice(0, 6)}····{address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        const injected = connectors.find((c) => c.type === "injected");
        if (injected) {
          connect({ connector: injected });
        }
      }}
      className="rounded-lg bg-shade-green px-4 py-1.5 text-sm font-medium text-black hover:bg-shade-green-dim transition-colors"
    >
      Connect Wallet
    </button>
  );
}
