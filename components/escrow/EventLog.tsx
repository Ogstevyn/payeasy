"use client";

import {
  ShieldCheck,
  Coins,
  Unlock,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { ContractEvent, ContractEventType } from "@/lib/stellar/events";

interface EventLogProps {
  events: ContractEvent[];
}

interface EventMeta {
  icon: React.ElementType;
  label: string;
  iconClass: string;
}

const EVENT_META: Record<ContractEventType, EventMeta> = {
  escrow_created: {
    icon: ShieldCheck,
    label: "Escrow Created",
    iconClass: "text-brand-400",
  },
  contribution: {
    icon: Coins,
    label: "Contribution",
    iconClass: "text-accent-400",
  },
  released: {
    icon: Unlock,
    label: "Funds Released",
    iconClass: "text-emerald-400",
  },
  dispute_raised: {
    icon: AlertTriangle,
    label: "Dispute Raised",
    iconClass: "text-amber-400",
  },
  refunded: {
    icon: RotateCcw,
    label: "Refunded",
    iconClass: "text-sky-400",
  },
  unknown: {
    icon: HelpCircle,
    label: "Unknown Event",
    iconClass: "text-dark-500",
  },
};

function EventItem({ event }: { event: ContractEvent }) {
  const meta = EVENT_META[event.type];
  const Icon = meta.icon;

  return (
    <li className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full glass flex items-center justify-center flex-shrink-0 ${meta.iconClass}`}
        >
          <Icon size={15} />
        </div>
        <div className="w-px flex-1 bg-white/5 mt-2" />
      </div>

      {/* Content */}
      <div className="pb-6 min-w-0 flex-1">
        <p className="text-white text-sm font-medium">{meta.label}</p>
        <p className="text-dark-500 text-xs mt-0.5">
          {new Date(event.createdAt).toLocaleString()} &middot; Ledger{" "}
          {event.ledger}
        </p>
        <p className="text-dark-600 text-xs mt-1 font-mono truncate">
          {event.txHash}
        </p>
      </div>
    </li>
  );
}

export default function EventLog({ events }: EventLogProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-dark-500 text-sm">
        No contract events recorded yet.
      </div>
    );
  }

  return (
    <ul className="space-y-0">
      {events.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </ul>
  );
}
