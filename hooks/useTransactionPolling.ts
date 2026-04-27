"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface Transaction {
  id: string;
  hash: string;
  createdAt: string;
  sourceAccount: string;
  fee: string;
  memo?: string;
  isNew?: boolean;
}

interface UseTransactionPollingOptions {
  accountId: string | null;
  horizonUrl?: string;
}

interface UseTransactionPollingResult {
  transactions: Transaction[];
  isConnected: boolean;
  error: string | null;
}

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

export function useTransactionPolling({
  accountId,
  horizonUrl = HORIZON_TESTNET,
}: UseTransactionPollingOptions): UseTransactionPollingResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const newBadgeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearNewBadge = useCallback((txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, isNew: false } : tx))
    );
  }, []);

  useEffect(() => {
    if (!accountId) return;

    const url = `${horizonUrl}/accounts/${accountId}/transactions?cursor=now&order=asc`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data) as Record<string, unknown>;
        const tx: Transaction = {
          id: raw.id as string,
          hash: raw.hash as string,
          createdAt: raw.created_at as string,
          sourceAccount: raw.source_account as string,
          fee: raw.fee_charged as string,
          memo: raw.memo as string | undefined,
          isNew: true,
        };

        setTransactions((prev) => {
          if (prev.some((t) => t.id === tx.id)) return prev;
          return [tx, ...prev];
        });

        const timer = setTimeout(() => clearNewBadge(tx.id), 5000);
        newBadgeTimersRef.current.set(tx.id, timer);
      } catch {
        // ignore malformed SSE frames
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      setError("Lost connection to Horizon. Reconnecting…");
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      newBadgeTimersRef.current.forEach(clearTimeout);
      newBadgeTimersRef.current.clear();
    };
  }, [accountId, horizonUrl, clearNewBadge]);

  return { transactions, isConnected, error };
import { useEffect } from "react";

export interface HasTxHash {
  txHash: string;
}

export function getNewTransactionsByHash<T extends HasTxHash>(
  currentTransactions: T[],
  incomingTransactions: T[]
): T[] {
  const knownHashes = new Set(currentTransactions.map((tx) => tx.txHash));
  return incomingTransactions.filter((tx) => !knownHashes.has(tx.txHash));
}

export async function pollForNewTransactions<T extends HasTxHash>(
  currentTransactions: T[],
  fetchLatest: () => Promise<T[]>
): Promise<{ merged: T[]; newTransactions: T[] }> {
  const incoming = await fetchLatest();
  const newTransactions = getNewTransactionsByHash(currentTransactions, incoming);

  if (newTransactions.length === 0) {
    return { merged: currentTransactions, newTransactions };
  }

  return {
    merged: [...newTransactions, ...currentTransactions],
    newTransactions,
  };
}

export interface UseTransactionPollingOptions<T extends HasTxHash> {
  enabled: boolean;
  currentTransactions: T[];
  fetchLatest: () => Promise<T[]>;
  onNewTransactions: (transactions: T[]) => void;
  intervalMs?: number;
}

export default function useTransactionPolling<T extends HasTxHash>({
  enabled,
  currentTransactions,
  fetchLatest,
  onNewTransactions,
  intervalMs = 15_000,
}: UseTransactionPollingOptions<T>): void {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const tick = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      const { newTransactions } = await pollForNewTransactions(currentTransactions, fetchLatest);
      if (!cancelled && newTransactions.length > 0) {
        onNewTransactions(newTransactions);
      }
    };

    const interval = window.setInterval(() => {
      void tick();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled, currentTransactions, fetchLatest, onNewTransactions, intervalMs]);
}
