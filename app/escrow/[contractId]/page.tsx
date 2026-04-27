"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import EventLog from "@/components/escrow/EventLog";
import { getContractEvents, ContractEvent } from "@/lib/stellar/events";

const POLL_INTERVAL_MS = 30_000;

export default function EscrowContractPage() {
  const params = useParams();
  const contractId = typeof params.contractId === "string" ? params.contractId : "";

  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!contractId) return;
    const fresh = await getContractEvents(contractId);
    // Prepend truly new events (keep reverse-chronological order)
    setEvents((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const newOnes = fresh.filter((e) => !existingIds.has(e.id));
      return [...newOnes, ...prev];
    });
    setLastFetched(new Date());
    setIsLoading(false);
  }, [contractId]);

  useEffect(() => {
    fetchEvents();
    const timer = setInterval(fetchEvents, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchEvents]);

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-white">Escrow Dashboard</h1>
            <p className="text-dark-500 mt-1 text-sm font-mono truncate max-w-xs sm:max-w-lg">
              {contractId}
            </p>
          </div>
          <button
            onClick={fetchEvents}
            className="btn-secondary !py-2 !px-4 !text-sm !rounded-lg flex items-center gap-2"
            aria-label="Refresh events"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Event Log */}
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Event Log</h2>
            {lastFetched && (
              <p className="text-dark-600 text-xs">
                Updated {lastFetched.toLocaleTimeString()}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <EventLog events={events} />
          )}
        </section>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-dark-500 hover:text-brand-400 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
import { Metadata } from "next";
import EscrowDashboardClient from "./EscrowDashboardClient";

export async function generateMetadata({ params }: { params: { contractId: string } }): Promise<Metadata> {
  const shortId = params.contractId.length <= 10
    ? params.contractId
    : `${params.contractId.slice(0, 4)}...${params.contractId.slice(-4)}`;
  return {
    title: `Escrow ${shortId} — PayEasy`,
    description: `Manage Stellar escrow contract ${params.contractId} on PayEasy. Trustlessly collect and track rent payments powered by the Stellar blockchain.`,
  };
}

export default function EscrowDashboardPage({ params }: { params: { contractId: string } }) {
  return <EscrowDashboardClient contractId={params.contractId} />;
}

