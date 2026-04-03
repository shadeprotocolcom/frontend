"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { TabNav, type Tab } from "@/components/TabNav";
import { ShieldTab } from "@/components/ShieldTab";
import { BalanceTab } from "@/components/BalanceTab";
import { SendTab } from "@/components/SendTab";
import { UnshieldTab } from "@/components/UnshieldTab";
import { Spinner } from "@/components/Spinner";
import { useShadeClient } from "@/hooks/useShadeClient";

export default function Home() {
  const { isConnected } = useAccount();
  const client = useShadeClient();
  const [activeTab, setActiveTab] = useState<Tab>("shield");

  if (!isConnected) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-shade-surface">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                stroke="#22c55e"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V16M8 10V14M16 10V14"
                stroke="#22c55e"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Shade Protocol</h1>
          <p className="mt-2 text-shade-muted">
            Private cBTC transactions on Citrea
          </p>
          <div className="mt-8">
            <ConnectKitButton />
          </div>
        </div>
      </div>
    );
  }

  if (!client.isInitialized) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="shade-card">
            <h2 className="text-xl font-semibold text-white">
              Initialize Shade Account
            </h2>
            <p className="mt-2 text-sm text-shade-muted">
              Sign a message to derive your privacy keys. This signature never
              leaves your device and is used to encrypt/decrypt your private
              balance.
            </p>

            {client.error && (
              <div className="mt-4 rounded-lg border border-shade-red/20 bg-shade-red/5 p-3">
                <p className="text-sm text-shade-red">{client.error}</p>
              </div>
            )}

            <button
              onClick={client.initialize}
              disabled={client.isInitializing}
              className="shade-btn-primary mt-6 w-full"
            >
              {client.isInitializing ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Sign in wallet...
                </span>
              ) : (
                "Sign to initialize"
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-shade-muted">
            Your keys are derived deterministically from this signature. You can
            always re-derive them by signing again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 mb-4">
        <p className="text-xs text-yellow-400 text-center">
          <strong>Testnet Preview</strong> — This system is for testing only and not suitable for large amounts.
          The anonymity set is currently too small to provide real privacy, and the protocol has not been audited by external organizations.
        </p>
      </div>

      <div className="shade-card space-y-6">
        <TabNav active={activeTab} onChange={setActiveTab} />

        {activeTab === "shield" && <ShieldTab client={client} />}
        {activeTab === "balance" && <BalanceTab client={client} />}
        {activeTab === "send" && <SendTab client={client} />}
        {activeTab === "unshield" && <UnshieldTab client={client} />}
      </div>
    </div>
  );
}
