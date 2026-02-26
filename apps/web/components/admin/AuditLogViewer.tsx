/**
 * @file components/admin/AuditLogViewer.tsx
 * @description View role change audit logs for compliance and monitoring
 */

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";
import { formatAuditAction, getRoleLabel } from "@/lib/auth/roles";
import { ROLE_METADATA } from "@/lib/types/roles";
import type { RoleAudit, AdminRole } from "@/lib/types/roles";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface AuditLogViewerProps {
  limit?: number;
}

interface AuditLogItem extends RoleAudit {
  admin_user?: {
    user_id: string;
    user?: {
      username: string;
      email?: string;
    };
  };
  changed_by_user?: {
    username: string;
    email?: string;
  };
}

// ──────────────────────────────────────────────────────────────
// Audit Log Viewer
// ──────────────────────────────────────────────────────────────

export function AuditLogViewer({ limit = 50 }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/audit-logs?limit=${limit}`);

        if (!response.ok) {
          throw new Error("Failed to fetch audit logs");
        }

        const data = await response.json();
        setLogs(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [limit]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-slate-600">Loading audit logs...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-900/20">
        <div className="text-red-800 dark:text-red-200">{error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Audit Log</h2>

      {logs.length === 0 ? (
        <Card className="p-8 text-center text-slate-600">No audit logs yet</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {logs.map((log) => (
              <AuditLogEntry key={log.id} log={log} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Audit Log Entry
// ──────────────────────────────────────────────────────────────

interface AuditLogEntryProps {
  log: AuditLogItem;
}

function AuditLogEntry({ log }: AuditLogEntryProps) {
  const userDisplay = log.admin_user?.user?.username || "Unknown User";
  const actionBy = log.changed_by_user?.username || "System";
  const timestamp = new Date(log.timestamp);

  const actionColor = {
    created: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    updated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    deleted: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
    suspended: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    reactivated: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  };

  const actionEmoji = {
    created: "➕",
    updated: "✏️",
    deleted: "🗑️",
    suspended: "⏸️",
    reactivated: "▶️",
  };

  return (
    <div className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30">
      {/* Icon */}
      <div className="flex-shrink-0 text-2xl">
        {actionEmoji[log.action as keyof typeof actionEmoji]}
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium">{userDisplay}</span>
          <Badge className={cn(actionColor[log.action as keyof typeof actionColor], "text-xs")}>
            {log.action}
          </Badge>
        </div>

        {/* Action Description */}
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
          {formatAuditAction(log.action, log.old_role as any, log.new_role as any)}
          {log.reason && ` — ${log.reason}`}
        </p>

        {/* Role Changes */}
        {log.old_role && log.new_role && (
          <div className="mb-2 text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Role changed from{" "}
              <Badge
                className={cn(
                  "mx-1 inline-block text-xs",
                  ROLE_METADATA[log.old_role as AdminRole]?.color
                )}
              >
                {getRoleLabel(log.old_role as AdminRole)}
              </Badge>
              to
              <Badge
                className={cn(
                  "mx-1 inline-block text-xs",
                  ROLE_METADATA[log.new_role as AdminRole]?.color
                )}
              >
                {getRoleLabel(log.new_role as AdminRole)}
              </Badge>
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-500">
          <p>Changed by: {actionBy}</p>
          <p>
            {timestamp.toLocaleDateString()} at {timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Quick Stats Component
// ──────────────────────────────────────────────────────────────

export function AuditLogStats() {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/audit-logs?limit=1000");
        if (!response.ok) return;

        const data = await response.json();
        const logs = data.data as AuditLogItem[];

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todayCount = logs.filter(
          (log) => new Date(log.timestamp).getTime() >= today.getTime()
        ).length;

        const weekCount = logs.filter((log) => new Date(log.timestamp) >= weekAgo).length;

        setStats({
          total: logs.length,
          today: todayCount,
          thisWeek: weekCount,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">TOTAL CHANGES</div>
        <div className="mt-2 text-2xl font-bold">{stats.total}</div>
      </Card>
      <Card className="p-4">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">TODAY</div>
        <div className="mt-2 text-2xl font-bold">{stats.today}</div>
      </Card>
      <Card className="p-4">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">THIS WEEK</div>
        <div className="mt-2 text-2xl font-bold">{stats.thisWeek}</div>
      </Card>
    </div>
  );
}
