/**
 * @file components/admin/PermissionGuard.tsx
 * @description Components for conditional rendering based on admin permissions
 */

"use client";

import { ReactNode } from "react";
import { hasPermission } from "@/lib/auth/roles";
import type { AuthorizationContext, PermissionKey, AdminRole } from "@/lib/types/roles";

// ──────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────

interface PermissionGuardProps {
  context: AuthorizationContext | null | undefined;
  permission?: PermissionKey | PermissionKey[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

interface RoleGuardProps {
  context: AuthorizationContext | null | undefined;
  roles: AdminRole | AdminRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

interface SuspenseGuardProps {
  context: AuthorizationContext | null | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}

// ──────────────────────────────────────────────────────────────
// Permission Guard
// ──────────────────────────────────────────────────────────────

/**
 * Guard component that renders children only if user has specific permission(s)
 *
 * @example
 * ```tsx
 * <PermissionGuard context={auth} permission="users.delete">
 *   <DeleteButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  context,
  permission,
  requireAll = true,
  children,
  fallback = null,
}: PermissionGuardProps) {
  // No context = not authenticated
  if (!context) {
    return fallback;
  }

  // No permission check = always show
  if (!permission) {
    return children;
  }

  // Check permissions
  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasRequired = requireAll
    ? permissions.every((p) => hasPermission(context, p))
    : permissions.some((p) => hasPermission(context, p));

  return hasRequired ? children : fallback;
}

// ──────────────────────────────────────────────────────────────
// Role Guard
// ──────────────────────────────────────────────────────────────

/**
 * Guard component that renders children only if user has specific role
 *
 * @example
 * ```tsx
 * <RoleGuard context={auth} roles="super_admin">
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ context, roles, children, fallback = null }: RoleGuardProps) {
  if (!context) {
    return fallback;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasRole = roleArray.includes(context.role as AdminRole);

  return hasRole ? children : fallback;
}

// ──────────────────────────────────────────────────────────────
// Admin Guard
// ──────────────────────────────────────────────────────────────

/**
 * Guard component that renders children only if user is any admin
 *
 * @example
 * ```tsx
 * <AdminGuard context={auth}>
 *   <AdminBar />
 * </AdminGuard>
 * ```
 */
export function AdminGuard({ context, children, fallback = null }: SuspenseGuardProps) {
  if (!context || !context.is_admin) {
    return fallback;
  }

  return children;
}

// ──────────────────────────────────────────────────────────────
// Super Admin Guard
// ──────────────────────────────────────────────────────────────

/**
 * Guard component that renders children only if user is super admin
 */
export function SuperAdminGuard({ context, children, fallback = null }: SuspenseGuardProps) {
  if (!context || !context.is_super_admin) {
    return fallback;
  }

  return children;
}

// ──────────────────────────────────────────────────────────────
// Conditional Wrapper (for CSS classes)
// ──────────────────────────────────────────────────────────────

interface ConditionalWrapperProps {
  context: AuthorizationContext | null | undefined;
  permission?: PermissionKey | PermissionKey[];
  requireAll?: boolean;
  children: ReactNode;
  disabledClassName?: string;
}

/**
 * Wrapper that disables/grays out content if user lacks permission
 * Useful for buttons that should be visually disabled
 *
 * @example
 * ```tsx
 * <ConditionalWrapper context={auth} permission="users.delete">
 *   <button>Delete User</button>
 * </ConditionalWrapper>
 * ```
 */
export function ConditionalWrapper({
  context,
  permission,
  requireAll = true,
  children,
  disabledClassName = "opacity-50 cursor-not-allowed pointer-events-none",
}: ConditionalWrapperProps) {
  // No permission check = always enabled
  if (!permission || !context) {
    return <div className={!context ? disabledClassName : ""}>{children}</div>;
  }

  // Check permissions
  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasRequired = requireAll
    ? permissions.every((p) => hasPermission(context, p))
    : permissions.some((p) => hasPermission(context, p));

  return <div className={!hasRequired ? disabledClassName : ""}>{children}</div>;
}

// ──────────────────────────────────────────────────────────────
// Hook: usePermission
// ──────────────────────────────────────────────────────────────

/**
 * Hook to check permissions in component logic
 *
 * @example
 * ```tsx
 * const { canDelete } = usePermission(context)
 * if (canDelete('users.delete')) {
 *   // allow deletion
 * }
 * ```
 */
export function usePermission(context: AuthorizationContext | null | undefined) {
  return {
    has: (permission: PermissionKey) => {
      return context ? hasPermission(context, permission) : false;
    },
    hasAll: (permissions: PermissionKey[]) => {
      return context ? permissions.every((p) => hasPermission(context, p)) : false;
    },
    hasAny: (permissions: PermissionKey[]) => {
      return context ? permissions.some((p) => hasPermission(context, p)) : false;
    },
    isAdmin: context?.is_admin || false,
    isSuperAdmin: context?.is_super_admin || false,
    role: context?.role,
  };
}

// ──────────────────────────────────────────────────────────────
// Component: PermissionBadge
// ──────────────────────────────────────────────────────────────

import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

interface PermissionBadgeProps {
  permission: PermissionKey;
  context: AuthorizationContext | null | undefined;
}

/**
 * Badge that shows permission status
 */
export function PermissionBadge({ permission, context }: PermissionBadgeProps) {
  const has = context ? hasPermission(context, permission) : false;

  return (
    <Badge
      className={cn(
        "text-xs",
        has
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
      )}
    >
      {has ? "✓" : "✗"} {permission}
    </Badge>
  );
}
