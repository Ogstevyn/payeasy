/**
 * @file components/admin/AdminRoleManager.tsx
 * @description Admin panel for managing roles and permissions
 */

"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Edit2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  ROLE_METADATA,
  PERMISSION_METADATA,
  type AdminRole,
  type AdminUserWithUser,
  type PermissionKey,
} from "@/lib/types/roles";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface AdminRoleManagerProps {
  onRoleAssigned?: (admin: AdminUserWithUser) => void;
  onRoleRemoved?: (adminId: string) => void;
}

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    user_id: string;
    role: AdminRole;
    permissions?: PermissionKey[];
  }) => Promise<void>;
  isLoading?: boolean;
}

// ──────────────────────────────────────────────────────────────
// Admin Role Manager
// ──────────────────────────────────────────────────────────────

export function AdminRoleManager({ onRoleAssigned, onRoleRemoved }: AdminRoleManagerProps) {
  const [admins, setAdmins] = useState<AdminUserWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState<string | null>(null);

  // Fetch admin users
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/roles");

        if (!response.ok) {
          throw new Error("Failed to fetch admin users");
        }

        const data = await response.json();
        setAdmins(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleRoleAssigned = (admin: AdminUserWithUser) => {
    setAdmins((prev) => [admin, ...prev]);
    setShowAssignModal(false);
    onRoleAssigned?.(admin);
  };

  const handleRoleRemoved = async (adminId: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/roles/${adminId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove admin");
      }

      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
      onRoleRemoved?.(adminId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Roles</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage admin users and their permissions
          </p>
        </div>
        <Button onClick={() => setShowAssignModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Role
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Admin Users List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-600">Loading admin users...</div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-slate-600">No admin users assigned yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Assigned</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {admins.map((admin) => {
                  const roleMetadata = ROLE_METADATA[admin.role];
                  return (
                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{admin.user.username}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {admin.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn("inline-block", roleMetadata?.color)}>
                          {roleMetadata?.icon} {roleMetadata?.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            "inline-block",
                            admin.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                              : admin.status === "suspended"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200"
                          )}
                        >
                          {admin.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(admin.assigned_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowPermissionsModal(admin.id)}
                            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View permissions"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRoleRemoved(admin.id)}
                            className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Remove admin"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modals */}
      <AssignRoleModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={async (data) => {
          try {
            const response = await fetch("/api/admin/roles", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Failed to assign role");
            }

            const result = await response.json();
            handleRoleAssigned(result.data);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
          }
        }}
      />

      {showPermissionsModal && (
        <PermissionsModal
          adminId={showPermissionsModal}
          admin={admins.find((a) => a.id === showPermissionsModal)!}
          onClose={() => setShowPermissionsModal(null)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Assign Role Modal
// ──────────────────────────────────────────────────────────────

function AssignRoleModal({ isOpen, onClose, onSubmit, isLoading }: AssignRoleModalProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AdminRole>("analyst");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (!userId) {
      alert("Please select a user");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ user_id: userId, role });
      setUserId("");
      setRole("analyst");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 w-full max-w-md">
        <div className="space-y-4 p-6">
          <h3 className="text-lg font-bold">Assign Admin Role</h3>

          <div>
            <label className="mb-2 block text-sm font-medium">User</label>
            <input
              type="text"
              placeholder="Enter user ID or username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            >
              {Object.entries(ROLE_METADATA).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.label} - {data.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || isLoading}>
              {submitting ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Permissions Modal
// ──────────────────────────────────────────────────────────────

function PermissionsModal({
  adminId,
  admin,
  onClose,
}: {
  adminId: string;
  admin: AdminUserWithUser;
  onClose: () => void;
}) {
  const roleMetadata = ROLE_METADATA[admin.role];
  const permissions = admin.role === "custom" ? admin.custom_permissions : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 max-h-96 w-full max-w-2xl overflow-y-auto">
        <div className="space-y-4 p-6">
          <div>
            <h3 className="text-lg font-bold">{admin.user.username}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{roleMetadata?.label}</p>
          </div>

          {permissions ? (
            <div>
              <h4 className="mb-3 font-medium">Custom Permissions</h4>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission) => {
                  const meta = PERMISSION_METADATA[permission];
                  return (
                    <Badge key={permission} className="text-xs">
                      {meta?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="mb-3 font-medium">Role Permissions</h4>
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                {roleMetadata?.description}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
