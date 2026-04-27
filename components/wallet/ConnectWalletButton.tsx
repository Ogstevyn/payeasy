"use client";

import { useState, useRef } from "react";
import { Wallet, ChevronDown, RefreshCw } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

interface ConnectWalletButtonProps {
  horizonUrl?: string;
}

export default function ConnectWalletButton({
  horizonUrl,
}: ConnectWalletButtonProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { balance, isLoading, error, refresh } = useWalletBalance({
    accountId,
    horizonUrl,
    refreshSignal,
  });

  function handleConnect() {
    const mockId = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";
    setAccountId(mockId);
    setIsDropdownOpen(false);
  }

  function handleDisconnect() {
    setAccountId(null);
    setIsDropdownOpen(false);
  }

  function handleRefresh() {
    setRefreshSignal((s) => s + 1);
    refresh();
  }

  function shortAddress(id: string) {
    return `${id.slice(0, 4)}…${id.slice(-4)}`;
  }

  if (!accountId) {
    return (
      <button
        onClick={handleConnect}
        className="btn-primary !py-2.5 !px-5 !text-sm !rounded-lg"
      >
        <Wallet size={16} />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((o) => !o)}
        className="btn-secondary !py-2.5 !px-4 !text-sm !rounded-lg flex items-center gap-2"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <Wallet size={16} />
        <span>{shortAddress(accountId)}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 glass rounded-xl p-4 z-50 shadow-xl animate-fade-in">
          <p className="text-xs text-dark-400 mb-1">XLM Balance</p>
          <div className="flex items-center justify-between mb-4">
            {isLoading ? (
              <span className="text-dark-400 text-sm animate-pulse">
                Loading…
              </span>
            ) : error ? (
              <span className="text-red-400 text-sm">{error}</span>
            ) : (
              <span className="text-white font-semibold text-lg">
                {balance !== null ? `${parseFloat(balance).toFixed(2)} XLM` : "—"}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="text-dark-400 hover:text-white transition-colors"
              aria-label="Refresh balance"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="text-xs text-dark-500 font-mono break-all mb-4">
            {accountId}
          </p>
          <button
            onClick={handleDisconnect}
            className="w-full btn-secondary !py-2 !text-sm !rounded-lg !justify-center"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
