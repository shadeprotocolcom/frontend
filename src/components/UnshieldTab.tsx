"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { Spinner } from "./Spinner";
import { TxLink } from "./TxLink";
import { formatBtc, parseBtc, isValidAddress } from "@/lib/format";
import type { ShadeClientHandle } from "@/hooks/useShadeClient";

interface UnshieldTabProps {
  client: ShadeClientHandle;
}

type UnshieldState =
  | { step: "idle" }
  | { step: "proving" }
  | { step: "submitting" }
  | { step: "success"; txHash: string }
  | { step: "error"; message: string };

export function UnshieldTab({ client }: UnshieldTabProps) {
  const { address } = useAccount();

  const [amount, setAmount] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [unshieldState, setUnshieldState] = useState<UnshieldState>({
    step: "idle",
  });

  const recipient = recipientInput.trim() || (address ?? "");

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
    parsedAmount <= client.balance;

  const isValidRecipient =
    recipient === "" || isValidAddress(recipient);

  const canUnshield =
    isValidAmount && isValidRecipient && recipient !== "";

  const handleUnshield = useCallback(async () => {
    if (!parsedAmount || parsedAmount <= 0n || !recipient) return;

    setUnshieldState({ step: "proving" });

    try {
      const txHash = await client.unshield(recipient, parsedAmount);
      setUnshieldState({ step: "success", txHash });
      setAmount("");

      // Refresh balance after a short delay
      setTimeout(() => client.syncBalance(), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unshield transaction failed";
      setUnshieldState({ step: "error", message });
    }
  }, [parsedAmount, recipient, client]);

  const handleReset = useCallback(() => {
    setUnshieldState({ step: "idle" });
  }, []);

  const isProcessing =
    unshieldState.step === "proving" || unshieldState.step === "submitting";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Unshield scBTC</h2>
        <p className="mt-1 text-sm text-shade-muted">
          Convert scBTC back to regular cBTC
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-shade-muted">
            Amount (scBTC)
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
                  if (unshieldState.step === "error") {
                    setUnshieldState({ step: "idle" });
                  }
                }
              }}
              className="shade-input pr-20"
              disabled={isProcessing}
            />
            <button
              onClick={() => setAmount(formatBtc(client.balance))}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-shade-border px-2.5 py-1 text-xs font-medium text-shade-muted transition-colors hover:bg-shade-border-hover hover:text-shade-text"
            >
              MAX
            </button>
          </div>
          <p className="mt-1.5 text-xs text-shade-muted">
            Available: {formatBtc(client.balance)} scBTC
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-shade-muted">
            Recipient address (optional)
          </label>
          <input
            type="text"
            placeholder={address ? `${address} (your wallet)` : "0x..."}
            value={recipientInput}
            onChange={(e) => {
              setRecipientInput(e.target.value);
              if (unshieldState.step === "error") {
                setUnshieldState({ step: "idle" });
              }
            }}
            className="shade-input font-mono text-sm"
            disabled={isProcessing}
          />
          {recipientInput === "" && address && (
            <p className="mt-1.5 text-xs text-shade-muted">
              Defaults to your connected wallet
            </p>
          )}
          {recipientInput !== "" && !isValidAddress(recipientInput) && (
            <p className="mt-1.5 text-xs text-shade-red">
              Invalid Ethereum address
            </p>
          )}
        </div>

        {parsedAmount !== null && parsedAmount > 0n && (
          <div className="rounded-lg border border-shade-border bg-shade-bg p-4">
            <p className="text-sm text-shade-muted">
              Converting{" "}
              <span className="font-medium text-white">{amount} scBTC</span>{" "}
              back to{" "}
              <span className="font-medium text-shade-green">
                {amount} cBTC
              </span>
            </p>
            {recipient && (
              <p className="mt-1 font-mono text-xs text-shade-muted">
                To: {recipient.slice(0, 10)}...{recipient.slice(-8)}
              </p>
            )}
          </div>
        )}

        {unshieldState.step === "success" && (
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
                  Unshield successful
                </p>
                <div className="mt-1">
                  <TxLink hash={unshieldState.txHash} />
                </div>
              </div>
            </div>
          </div>
        )}

        {unshieldState.step === "error" && (
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
                  {unshieldState.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={
            unshieldState.step === "success" || unshieldState.step === "error"
              ? handleReset
              : handleUnshield
          }
          disabled={
            isProcessing || (unshieldState.step === "idle" && !canUnshield)
          }
          className="shade-btn-danger w-full"
        >
          {unshieldState.step === "proving" && (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Generating proof...
            </span>
          )}
          {unshieldState.step === "submitting" && (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Submitting transaction...
            </span>
          )}
          {unshieldState.step === "success" && "Unshield again"}
          {unshieldState.step === "error" && "Try again"}
          {unshieldState.step === "idle" && "Unshield"}
        </button>
      </div>
    </div>
  );
}
