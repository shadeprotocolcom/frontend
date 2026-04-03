"use client";

import { Spinner } from "./Spinner";
import { formatBtc } from "@/lib/format";
import type { ShadeClientHandle } from "@/hooks/useShadeClient";

interface BalanceTabProps {
  client: ShadeClientHandle;
}

export function BalanceTab({ client }: BalanceTabProps) {
  const { balance, isSyncing, error, syncBalance } = client;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Shielded Balance</h2>
        <p className="mt-1 text-sm text-shade-muted">
          Your private scBTC balance, auto-refreshes every 10 seconds
        </p>
      </div>

      <div className="rounded-xl border border-shade-border bg-shade-bg p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-shade-muted">
          scBTC Balance
        </p>
        <div className="mt-4 flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold tabular-nums tracking-tight text-white">
            {formatBtc(balance)}
          </span>
          <span className="text-xl text-shade-muted">scBTC</span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {isSyncing ? (
            <span className="flex items-center gap-2 text-sm text-shade-muted">
              <Spinner size="sm" />
              Syncing...
            </span>
          ) : (
            <button
              onClick={() => syncBalance()}
              className="flex items-center gap-1.5 text-sm text-shade-muted transition-colors hover:text-shade-text"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-shade-red/20 bg-shade-red/5 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-shade-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm text-shade-red">{error}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-shade-border bg-shade-surface p-4">
        <p className="text-xs text-shade-muted">
          Your shielded balance is stored as encrypted commitments on Citrea.
          Only you can view the actual amount using your spending key.
        </p>
      </div>
    </div>
  );
}
