"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLandlordEscrows, getLandlordStats, type EscrowContract, type LandlordStats } from "@/lib/stellar/queries";
import { useStellar } from "@/context/StellarContext";
import EscrowDashboardSkeleton from "@/components/escrow/EscrowDashboardSkeleton";
import FundingProgress from "@/components/escrow/FundingProgress";
import { DeadlineCountdown } from "@/components/escrow/DeadlineCountdown";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, publicKey, isRestoring } = useStellar();
  const [escrows, setEscrows] = useState<EscrowContract[]>([]);
  const [stats, setStats] = useState<LandlordStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isRestoring) return;
    if (!isConnected || !publicKey) {
      router.push("/connect");
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [escrowsData, statsData] = await Promise.all([
          getLandlordEscrows(publicKey!),
          getLandlordStats(publicKey!),
        ]);
        setEscrows(escrowsData);
        setStats(statsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isConnected, publicKey, isRestoring, router]);

  if (isRestoring || loading) return <EscrowDashboardSkeleton />;
  if (!isConnected) return null;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-900/40 rounded-xl p-6">
          <div className="text-xs text-dark-500">Total Escrowed</div>
          <div className="text-2xl font-bold">{stats?.totalEscrowed ?? "-"}</div>
        </div>
        <div className="bg-dark-900/40 rounded-xl p-6">
          <div className="text-xs text-dark-500">Active Escrows</div>
          <div className="text-2xl font-bold">{stats?.activeEscrows ?? "-"}</div>
        </div>
        <div className="bg-dark-900/40 rounded-xl p-6">
          <div className="text-xs text-dark-500">Total Released</div>
          <div className="text-2xl font-bold">{stats?.totalReleased ?? "-"}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {escrows.map((escrow) => (
          <div key={escrow.id} className="bg-dark-900/40 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">{escrow.id}</div>
              <button className="btn-primary !py-1.5 !px-4 !text-xs">Release</button>
            </div>
            <FundingProgress totalFunded={escrow.totalFunded} totalRequired={Number(escrow.totalRent)} />
            <div className="flex justify-between text-xs text-dark-500">
              <div>Status: <span className="font-bold text-dark-200">{escrow.status}</span></div>
              <div>Deadline: <DeadlineCountdown deadlineEpoch={escrow.deadlineEpoch} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
