"use client";

import { useCallback, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Spinner } from "./Spinner";
import { TxLink } from "./TxLink";
import { formatBtc, parseBtc } from "@/lib/format";
import type { ShadeClientHandle } from "@/hooks/useShadeClient";

interface ShieldTabProps {
  client: ShadeClientHandle;
}

type ShieldState =
  | { step: "idle" }
  | { step: "confirming" }
  | { step: "submitting" }
  | { step: "success"; txHash: string }
  | { step: "error"; message: string };

export function ShieldTab({ client }: ShieldTabProps) {
  const { address } = useAccount();
  const { data: nativeBalance } = useBalance({ address });

  const [amount, setAmount] = useState("");
  const [shieldState, setShieldState] = useState<ShieldState>({ step: "idle" });

  const parsedAmount = (() => {
    try {
      return parseBtc(amount);
    } catch {
      return null;
    }
  })();

  const isValidAmount =
    parsedAmount !== null &&
    parsedAmount > 0n &&
    nativeBalance !== undefined &&
    parsedAmount <= nativeBalance.value;

  const handleShield = useCallback(async () => {
    if (!parsedAmount || parsedAmount <= 0n) return;

    setShieldState({ step: "confirming" });

    try {
      setShieldState({ step: "submitting" });
      const txHash = await client.shield(parsedAmount);
      setShieldState({ step: "success", txHash });
      setAmount("");

      // Refresh balance after a short delay
      setTimeout(() => client.syncBalance(), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Shield transaction failed";
      setShieldState({ step: "error", message });
    }
  }, [parsedAmount, client]);

  const handleReset = useCallback(() => {
    setShieldState({ step: "idle" });
  }, []);

  const handleMaxClick = useCallback(() => {
    if (nativeBalance) {
      setAmount(formatBtc(nativeBalance.value));
    }
  }, [nativeBalance]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Shield cBTC</h2>
        <p className="mt-1 text-sm text-shade-muted">
          Convert cBTC to shielded scBTC for private transactions
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-shade-muted">
            Amount (cBTC)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                  setAmount(val);
                  if (shieldState.step === "error") {
                    setShieldState({ step: "idle" });
                  }
                }
              }}
              className="shade-input pr-20"
              disabled={
                shieldState.step === "confirming" ||
                shieldState.step === "submitting"
              }
            />
            <button
              onClick={handleMaxClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-shade-border px-2.5 py-1 text-xs font-medium text-shade-muted transition-colors hover:bg-shade-border-hover hover:text-shade-text"
            >
              MAX
            </button>
          </div>
          {nativeBalance && (
            <p className="mt-1.5 text-xs text-shade-muted">
              Wallet balance: {formatBtc(nativeBalance.value)} cBTC
            </p>
          )}
        </div>

        {parsedAmount !== null && parsedAmount > 0n && (
          <div className="rounded-lg border border-shade-border bg-shade-bg p-4">
            <p className="text-sm text-shade-muted">
              You are converting{" "}
              <span className="font-medium text-white">{amount} cBTC</span> to{" "}
              <span className="font-medium text-shade-green">
                {amount} scBTC
              </span>
            </p>
          </div>
        )}

        {shieldState.step === "success" && (
          <div className="rounded-lg border border-shade-green/20 bg-shade-green/5 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-shade-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-shade-green">
                  Shield successful
                </p>
                <div className="mt-1">
                  <TxLink hash={shieldState.txHash} />
                </div>
              </div>
            </div>
          </div>
        )}

        {shieldState.step === "error" && (
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-shade-red">
                  Transaction failed
                </p>
                <p className="mt-0.5 text-xs text-shade-muted">
                  {shieldState.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={
            shieldState.step === "success" || shieldState.step === "error"
              ? handleReset
              : handleShield
          }
          disabled={
            shieldState.step === "confirming" ||
            shieldState.step === "submitting" ||
            (shieldState.step === "idle" && !isValidAmount)
          }
          className="shade-btn-primary w-full"
        >
          {shieldState.step === "confirming" && (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Confirm in wallet...
            </span>
          )}
          {shieldState.step === "submitting" && (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Submitting transaction...
            </span>
          )}
          {shieldState.step === "success" && "Shield again"}
          {shieldState.step === "error" && "Try again"}
          {shieldState.step === "idle" && "Shield"}
        </button>
      </div>
    </div>
  );
}
