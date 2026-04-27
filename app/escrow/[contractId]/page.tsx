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

