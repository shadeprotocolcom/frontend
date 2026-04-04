"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";
import { ShadeClient } from "@shade-protocol/sdk";
import type { ShadeConfig } from "@shade-protocol/sdk";

export type { ShadeConfig };

const config: ShadeConfig = {
  chainId: 4114,
  rpcUrl: "https://rpc.citreascan.com",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  wcbtcAddress: process.env.NEXT_PUBLIC_WCBTC_ADDRESS || "",
  keyRegistryAddress:
    process.env.NEXT_PUBLIC_KEY_REGISTRY_ADDRESS || "0xDBeF67AaF7c9917a67f6710a611ED80C8326118d",
  indexerUrl:
    process.env.NEXT_PUBLIC_INDEXER_URL || "https://api.shade-protocol.com",
  proverUrl:
    process.env.NEXT_PUBLIC_PROVER_URL || "https://prover.shade-protocol.com",
};

interface ShadeClientState {
  isInitializing: boolean;
  isInitialized: boolean;
  balance: bigint;
  isSyncing: boolean;
  error: string | null;
}

export interface ShadeClientHandle {
  isInitializing: boolean;
  isInitialized: boolean;
  balance: bigint;
  isSyncing: boolean;
  error: string | null;
  config: ShadeConfig;
  initialize: () => Promise<void>;
  syncBalance: () => Promise<void>;
  shield: (amount: bigint) => Promise<string>;
  send: (recipient: string, amount: bigint) => Promise<string>;
  unshield: (recipient: string, amount: bigint) => Promise<string>;
  lookupRecipient: (address: string) => Promise<boolean>;
}

/**
 * Hook that manages a ShadeClient instance connected to the user's wallet.
 *
 * Uses the SDK's ShadeClient which handles key derivation, note management,
 * witness building, proof generation, and contract interaction internally.
 * The ShadeClient communicates with:
 *   - Indexer: GET /events, GET /merkle/root, GET /merkle/path/:index, POST /keys/register, GET /keys/:address
 *   - Prover:  POST /prove
 */
export function useShadeClient(): ShadeClientHandle {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<ShadeClientState>({
    isInitializing: false,
    isInitialized: false,
    balance: 0n,
    isSyncing: false,
    error: null,
  });

  const clientRef = useRef<ShadeClient | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initialize = useCallback(async () => {
    if (!walletClient || !address) return;

    setState((prev) => ({
      ...prev,
      isInitializing: true,
      error: null,
    }));

    try {
      // Create a new ShadeClient with the correct config
      const shadeClient = new ShadeClient(config);
      clientRef.current = shadeClient;

      // Create an ethers signer from the wagmi wallet client
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      // Connect triggers key derivation (signs KEY_DERIVATION_MESSAGE)
      // and performs initial balance sync via the indexer
      await shadeClient.connect(signer);

      // Register the viewing public key and master public key with the indexer.
      // The viewing public key is a BabyJubjub point that other users need to
      // encrypt notes for us via ECDH. The master public key is used for note
      // creation (npk derivation).
      const viewingPubKeyJson = await shadeClient.getViewingPublicKey();
      const masterPublicKey = shadeClient.getMasterPublicKey();

      // Store both keys as a combined JSON object so the sender can look up
      // everything needed to create and encrypt a note for us.
      const shadePublicKey = JSON.stringify({
        viewingPublicKey: JSON.parse(viewingPubKeyJson),
        masterPublicKey: masterPublicKey.toString(),
      });

      // POST /keys/register with { ethAddress, shadePublicKey }
      const response = await fetch(`${config.indexerUrl}/keys/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ethAddress: address,
          shadePublicKey,
        }),
      });

      if (!response.ok && response.status !== 409) {
        throw new Error("Failed to register with indexer");
      }

      // Restore notes from localStorage (survives page reload)
      const storageKey = `shade-notes-${address!.toLowerCase()}`;
      const savedNotes = localStorage.getItem(storageKey);
      if (savedNotes) {
        shadeClient.importNotes(savedNotes);
      }

      // Get initial balance
      const balance = await shadeClient.getBalance();

      // Save notes after sync
      localStorage.setItem(storageKey, shadeClient.exportNotes());

      setState((prev) => ({
        ...prev,
        isInitializing: false,
        isInitialized: true,
        balance,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initialize";
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        error: message,
      }));
    }
  }, [walletClient, address]);

  const saveNotes = useCallback(() => {
    if (!clientRef.current || !address) return;
    const storageKey = `shade-notes-${address.toLowerCase()}`;
    localStorage.setItem(storageKey, clientRef.current.exportNotes());
  }, [address]);

  const syncBalance = useCallback(async () => {
    if (!clientRef.current) return;

    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const balance = await clientRef.current.getBalance();
      saveNotes();

      setState((prev) => ({
        ...prev,
        balance,
        isSyncing: false,
        error: null,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sync balance";
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: message,
      }));
    }
  }, []);

  const shield = useCallback(
    async (amount: bigint): Promise<string> => {
      if (!clientRef.current) {
        throw new Error("Client not initialized");
      }

      return clientRef.current.shield(amount);
    },
    [],
  );

  const send = useCallback(
    async (recipient: string, amount: bigint): Promise<string> => {
      if (!clientRef.current) {
        throw new Error("Client not initialized");
      }

      return clientRef.current.send(recipient, amount);
    },
    [],
  );

  const unshield = useCallback(
    async (recipient: string, amount: bigint): Promise<string> => {
      if (!clientRef.current) {
        throw new Error("Client not initialized");
      }

      return clientRef.current.unshield(recipient, amount);
    },
    [],
  );

  const lookupRecipient = useCallback(
    async (recipientAddress: string): Promise<boolean> => {
      try {
        // Use the indexer's key registry endpoint: GET /keys/:address
        const response = await fetch(
          `${config.indexerUrl}/keys/${recipientAddress}`,
        );
        return response.ok;
      } catch {
        return false;
      }
    },
    [],
  );

  // Auto-sync balance every 10 seconds when initialized
  useEffect(() => {
    if (state.isInitialized) {
      syncBalance();
      syncIntervalRef.current = setInterval(syncBalance, 10_000);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [state.isInitialized, syncBalance]);

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      clientRef.current = null;
      setState({
        isInitializing: false,
        isInitialized: false,
        balance: 0n,
        isSyncing: false,
        error: null,
      });
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }
  }, [isConnected]);

  return {
    isInitializing: state.isInitializing,
    isInitialized: state.isInitialized,
    balance: state.balance,
    isSyncing: state.isSyncing,
    error: state.error,
    config,
    initialize,
    syncBalance,
    shield,
    send,
    unshield,
    lookupRecipient,
  };
}
