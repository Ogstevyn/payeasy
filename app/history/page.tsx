"use client";

import { Receipt, Wifi, WifiOff } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import { Metadata } from "next";
import { Suspense } from "react";
import HistoryClient from "./HistoryClient";
import TransactionListSkeleton from "@/components/history/TransactionListSkeleton";
import { History, LayoutDashboard, Database } from "lucide-react";
import Link from "next/link";
import { useTransactionPolling } from "@/hooks/useTransactionPolling";

// Replace with the actual connected wallet account ID when auth is wired up.
const DEMO_ACCOUNT_ID: string | null = null;

export default function HistoryPage() {
  const { transactions, isConnected, error } = useTransactionPolling({
    accountId: DEMO_ACCOUNT_ID,
  });
export const metadata: Metadata = {
  title: "Transaction History | PayEasy",
  description: "View your recent escrow contributions and rent payments verified on the Stellar blockchain.",
};

export default function HistoryPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Payment History</h1>
            <p className="text-dark-500 mt-1 text-sm">
              All your escrow transactions in one place.
            </p>
          </div>

          {DEMO_ACCOUNT_ID && (
            <div className="flex items-center gap-2 text-xs">
              {isConnected ? (
                <>
                  <Wifi size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Live</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-dark-500" />
                  <span className="text-dark-500">Connecting…</span>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mb-4 text-xs text-amber-400 glass px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="glass-card p-2">
          {transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Once you contribute to an escrow, your payment history will appear here."
              action={{
                label: "Create Escrow",
                onClick: () => {
                  window.location.href = "/escrow/create";
                },
              }}
            />
          ) : (
            <ul className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-start justify-between gap-4 py-4 px-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <Receipt size={15} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium truncate max-w-[180px] sm:max-w-xs">
                          {tx.hash}
                        </p>
                        {tx.isNew && (
                          <span className="text-[10px] font-semibold bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded-full animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-dark-500 text-xs mt-0.5">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-accent-400 text-sm font-semibold">
                      Fee: {tx.fee} stroops
                    </p>
                    <p className="text-dark-600 text-xs truncate max-w-[120px]">
                      {tx.sourceAccount.slice(0, 8)}…
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
    <main id="main-content" aria-label="Transaction History" className="min-h-screen pt-28 pb-20 relative overflow-hidden bg-[#0a0a0f]">
      {/* Background aesthetics */}
      <div className="mesh-gradient opacity-40 mix-blend-screen pointer-events-none fixed inset-0" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-left-8 duration-700 ease-out">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px] font-black uppercase tracking-[0.2em] shadow-inner backdrop-blur-md">
              <History className="h-4 w-4" />
              On-Chain Transaction Log
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] bg-gradient-to-br from-white via-white to-dark-700 bg-clip-text text-transparent">
                Activity <span className="text-brand-400">Vault</span>
              </h1>
              <p className="text-dark-500 text-xl font-medium leading-relaxed max-w-2xl">
                Securely exploring every rent contribution, release, and on-chain interaction associated with your account on the <span className="text-white font-bold">Stellar Network</span>.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
            <div className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-dark-400 text-xs font-bold">
              <Database className="h-4 w-4 text-brand-400" />
              <span>Horizon API: Healthy</span>
              <div className="h-2 w-2 rounded-full bg-accent-400 shadow-[0_0_10px_rgba(32,201,151,0.5)]" />
            </div>
            
            <Link 
              href="/dashboard"
              className="btn-secondary !text-xs !py-3.5 !px-8 group shadow-2xl hover:shadow-brand-500/10 !rounded-2xl !bg-dark-900/60 transition-all border-white/10"
            >
              <LayoutDashboard className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Overview
            </Link>
          </div>
        </header>

        <div className="relative animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-in-out fill-mode-backwards delay-300">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
          <Suspense fallback={<TransactionListSkeleton />}>
            <HistoryClient />
          </Suspense>
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-500/20 to-transparent" />
        </div>
      </div>
      
      {/* Decorative SVG elements */}
      <div className="fixed bottom-10 left-10 opacity-10 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="99.5" stroke="white" strokeDasharray="4 4" />
        </svg>
      </div>
    </main>
  );
}
