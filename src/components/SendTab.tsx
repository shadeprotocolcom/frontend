"use client";

import { useCallback, useState } from "react";
import { Spinner } from "./Spinner";
import { TxLink } from "./TxLink";
import { formatBtc, parseBtc, isValidAddress } from "@/lib/format";
import type { ShadeClientHandle } from "@/hooks/useShadeClient";

interface SendTabProps {
  client: ShadeClientHandle;
}

type SendState =
  | { step: "idle" }
  | { step: "validating" }
  | { step: "proving" }
  | { step: "submitting" }
  | { step: "success"; txHash: string }
  | { step: "error"; message: string };

export function SendTab({ client }: SendTabProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sendState, setSendState] = useState<SendState>({ step: "idle" });
  const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
  const [isCheckingRecipient, setIsCheckingRecipient] = useState(false);

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

  const canSend =
    isValidAmount && recipientValid === true && isValidAddress(recipient);

  const handleRecipientBlur = useCallback(async () => {
    if (!isValidAddress(recipient)) {
      setRecipientValid(null);
      return;
    }

    setIsCheckingRecipient(true);
    const exists = await client.lookupRecipient(recipient);
    setRecipientValid(exists);
    setIsCheckingRecipient(false);
  }, [recipient, client]);

  const handleSend = useCallback(async () => {
    if (!parsedAmount || parsedAmount <= 0n || !isValidAddress(recipient))
      return;

    setSendState({ step: "validating" });

    try {
      // Validate recipient
      const exists = await client.lookupRecipient(recipient);
      if (!exists) {
        setSendState({
          step: "error",
          message:
            "Recipient does not have a Shade account. They need to connect and initialize first.",
        });
        return;
      }

      setSendState({ step: "proving" });
      const txHash = await client.send(recipient, parsedAmount);

      setSendState({ step: "success", txHash });
      setAmount("");
      setRecipient("");
      setRecipientValid(null);

      // Refresh balance after a short delay
      setTimeout(() => client.syncBalance(), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Send transaction failed";
      setSendState({ step: "error", message });
    }
  }, [parsedAmount, recipient, client]);

  const handleReset = useCallback(() => {
    setSendState({ step: "idle" });
  }, []);

  const isProcessing =
    sendState.step === "validating" ||
    sendState.step === "proving" ||
    sendState.step === "submitting";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Private Send</h2>
        <p className="mt-1 text-sm text-shade-muted">
          Send scBTC privately to another Shade user
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-shade-muted">
            Recipient address
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                setRecipientValid(null);
                if (sendState.step === "error") {
                  setSendState({ step: "idle" });
                }
              }}
              onBlur={handleRecipientBlur}
              className="shade-input font-mono text-sm"
              disabled={isProcessing}
            />
            {isCheckingRecipient && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" className="text-shade-muted" />
              </div>
            )}
            {!isCheckingRecipient && recipientValid === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="h-5 w-5 text-shade-green"
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
              </div>
            )}
            {!isCheckingRecipient &&
              recipientValid === false &&
              isValidAddress(recipient) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-5 w-5 text-shade-red"
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
                </div>
              )}
          </div>
          {recipientValid === false && isValidAddress(recipient) && (
            <p className="mt-1.5 text-xs text-shade-red">
              This address has no Shade account
            </p>
          )}
        </div>

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
                  if (sendState.step === "error") {
                    setSendState({ step: "idle" });
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

        {sendState.step === "success" && (
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
                  Private transfer sent
                </p>
                <div className="mt-1">
                  <TxLink hash={sendState.txHash} />
                </div>
              </div>
            </div>
          </div>
        )}

        {sendState.step === "error" && (
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
                  {sendState.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={
            sendState.step === "success" || sendState.step === "error"
              ? handleReset
              : handleSend
          }
          disabled={isProcessing || (sendState.step === "idle" && !canSend)}
          className="shade-btn-primary w-full"
        >
          {sendState.step === "validating" && (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Validating recipient...
            </span>
          )}
          {sendState.step === "proving" && (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Generating proof...
            </span>
          )}
          {sendState.step === "submitting" && (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Submitting transaction...
            </span>
          )}
          {sendState.step === "success" && "Send again"}
          {sendState.step === "error" && "Try again"}
          {sendState.step === "idle" && "Send"}
        </button>
      </div>
    </div>
  );
}
