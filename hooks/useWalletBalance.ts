"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const POLL_INTERVAL_MS = 60 * 1000;

interface UseWalletBalanceOptions {
  accountId: string | null;
  horizonUrl?: string;
  refreshSignal?: number;
}

interface UseWalletBalanceResult {
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWalletBalance({
  accountId,
  horizonUrl = HORIZON_TESTNET,
  refreshSignal = 0,
}: UseWalletBalanceOptions): UseWalletBalanceResult {
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!accountId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${horizonUrl}/accounts/${accountId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        balances: Array<{ asset_type: string; balance: string }>;
      };
      const native = data.balances.find((b) => b.asset_type === "native");
      setBalance(native?.balance ?? "0");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  }, [accountId, horizonUrl]);

  useEffect(() => {
    if (!accountId) {
      setBalance(null);
      return;
    }

    fetchBalance();
    intervalRef.current = setInterval(fetchBalance, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [accountId, fetchBalance, refreshSignal]);

  return { balance, isLoading, error, refresh: fetchBalance };
}
