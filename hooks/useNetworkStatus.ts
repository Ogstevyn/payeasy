"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getNetworkHealth, NetworkHealth, NetworkStatus } from "@/lib/stellar/health";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export interface UseNetworkStatusResult {
  status: NetworkStatus;
  checkedAt: Date | null;
  isLoading: boolean;
}

export function useNetworkStatus(): UseNetworkStatusResult {
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = useCallback(async () => {
    setIsLoading(true);
    const result = await getNetworkHealth();
    setHealth(result);
import { useState, useEffect, useCallback } from "react";
import { getNetworkStatus, type HealthReport } from "@/lib/stellar/health";

interface UseNetworkStatusOptions {
  pollingInterval?: number;
  autoStart?: boolean;
}

/**
 * A hook that monitors and returns the current Soroban network status.
 * Automatically polls the RPC endpoint at a given interval.
 */
export default function useNetworkStatus(options: UseNetworkStatusOptions = {}) {
  const { pollingInterval = 30000, autoStart = true } = options;

  const [report, setReport] = useState<HealthReport>({
    status: "healthy", // Initial optimistic state
    latestLedger: 0,
    timestamp: Date.now(),
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    const newReport = await getNetworkStatus();
    setReport(newReport);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [check]);

  return {
    status: health?.status ?? "healthy",
    checkedAt: health?.checkedAt ?? null,
    isLoading,
    if (!autoStart) return;

    // Initial check
    refreshStatus();

    const timer = setInterval(refreshStatus, pollingInterval);
    return () => clearInterval(timer);
  }, [autoStart, pollingInterval, refreshStatus]);

  return {
    ...report,
    isLoading,
    refresh: refreshStatus,
    isOffline: report.status === "offline",
    isDegraded: report.status === "degraded",
    isHealthy: report.status === "healthy",
  };
}
