/**
 * @file lib/auth/roles.ts
 * @description Role-based access control utilities and permission checking.
 *
 * Provides functions for:
 * - Checking if user has permission
 * - Getting user's permissions
 * - Validating role escalation
 * - Managing role changes
 */

import {
  AdminRole,
  PermissionKey,
  AdminUser,
  AuthorizationContext,
  PermissionCheckResult,
  ROLE_PERMISSIONS,
  ROLE_METADATA,
} from '@/lib/types/roles'

// ──────────────────────────────────────────────────────────────
// Permission Checking
// ──────────────────────────────────────────────────────────────

/**
 * Check if user has a specific permission
 *
 * @param context Authorization context with user role and permissions
 * @param permission Permission to check
 * @returns Whether user has the permission
 *
 * @example
 * ```ts
 * const can_delete = hasPermission(context, 'users.delete')
 * if (!can_delete) {
 *   throw new Error('Insufficient permissions')
 * }
 * ```
 */
export function hasPermission(context: AuthorizationContext, permission: PermissionKey): boolean {
  return context.permissions.includes(permission)
}

/**
 * Check multiple permissions (AND logic)
 *
 * @param context Authorization context
 * @param permissions Permissions to check
 * @returns Whether user has ALL permissions
 */
export function hasAllPermissions(context: AuthorizationContext, permissions: PermissionKey[]): boolean {
  return permissions.every((p) => hasPermission(context, p))
}

/**
 * Check multiple permissions (OR logic)
 *
 * @param context Authorization context
 * @param permissions Permissions to check
 * @returns Whether user has ANY permission
 */
export function hasAnyPermission(context: AuthorizationContext, permissions: PermissionKey[]): boolean {
  return permissions.some((p) => hasPermission(context, p))
}

/**
 * Get detailed permission check result
 *
 * @param context Authorization context
 * @param permission Permission to check
 * @returns Detailed result with reason if denied
 */
export function checkPermission(
  context: AuthorizationContext,
  permission: PermissionKey,
): PermissionCheckResult {
  const allowed = hasPermission(context, permission)

  return {
    allowed,
    required_permission: permission,
    user_has_permission: allowed,
    reason: allowed ? undefined : `User lacks permission: ${permission}`,
  }
}

// ──────────────────────────────────────────────────────────────
// Role Utilities
// ──────────────────────────────────────────────────────────────

/**
 * Get all permissions for a role
 *
 * @param role Role to get permissions for
 * @param customPermissions Optional custom permissions for custom role
 * @returns Array of permissions
 */
export function getRolePermissions(role: AdminRole, customPermissions?: PermissionKey[]): PermissionKey[] {
  const basePermissions = ROLE_PERMISSIONS[role] || []

  if (role === 'custom' && customPermissions) {
    return customPermissions
  }

  return basePermissions
}

/**
 * Create authorization context from admin user
 *
 * @param admin Admin user record
 * @returns Authorization context
 */
export function createAuthorizationContext(admin: AdminUser): AuthorizationContext {
  const permissions = getRolePermissions(admin.role, admin.custom_permissions)

  return {
    user_id: admin.user_id,
    admin_id: admin.id,
    role: admin.role,
    permissions,
    is_admin: admin.status === 'active',
    is_super_admin: admin.role === 'super_admin' && admin.status === 'active',
  }
}

/**
 * Get role metadata
 *
 * @param role Role to get metadata for
 * @returns Role metadata (label, description, color, icon)
 */
export function getRoleMetadata(role: AdminRole) {
  return ROLE_METADATA[role]
}

/**
 * Get role label
 *
 * @param role Role to get label for
 * @returns Human-readable role label
 */
export function getRoleLabel(role: AdminRole): string {
  return ROLE_METADATA[role]?.label || role
}

// ──────────────────────────────────────────────────────────────
// Role Hierarchy & Escalation Prevention
// ──────────────────────────────────────────────────────────────

/**
 * Role hierarchy (higher number = more powerful)
 */
const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 100,
  moderator: 60,
  support: 40,
  analyst: 20,
  custom: 30,
}

/**
 * Check if one role can manage another role
 *
 * @param manager_role Role of the manager
 * @param target_role Role to be managed
 * @returns Whether manager can manage target
 *
 * @remarks
 * - Super admin can manage any role
 * - Users can only manage roles below their level
 * - This prevents privilege escalation
 */
export function canManageRole(manager_role: AdminRole, target_role: AdminRole): boolean {
  // Super admin can manage anyone
  if (manager_role === 'super_admin') {
    return true
  }

  // Can't manage equal or higher roles
  const manager_level = ROLE_HIERARCHY[manager_role] ?? 0
  const target_level = ROLE_HIERARCHY[target_role] ?? 0

  return manager_level > target_level
}

/**
 * Validate role assignment
 *
 * @param assigner_context Context of the user assigning the role
 * @param target_role Role being assigned
 * @returns Whether assignment is valid
 */
export function validateRoleAssignment(
  assigner_context: AuthorizationContext,
  target_role: AdminRole,
): boolean {
  // Must have permission to assign roles
  if (!hasPermission(assigner_context, 'users.assign_role')) {
    return false
  }

  // Prevent privilege escalation
  if (!assigner_context.role) {
    return false
  }

  return canManageRole(assigner_context.role, target_role)
}

// ──────────────────────────────────────────────────────────────
// Audit Helpers
// ──────────────────────────────────────────────────────────────

/**
 * Format audit log entry for display
 *
 * @param action Action type
 * @param old_role Previous role (if applicable)
 * @param new_role New role (if applicable)
 * @returns Human-readable description
 */
export function formatAuditAction(
  action: string,
  old_role?: AdminRole,
  new_role?: AdminRole,
): string {
  switch (action) {
    case 'created':
      return `Assigned role: ${getRoleLabel(new_role!)}`
    case 'updated':
      return `Role changed from ${getRoleLabel(old_role!)} to ${getRoleLabel(new_role!)}`
    case 'deleted':
      return `Removed from admin: was ${getRoleLabel(old_role!)}`
    case 'suspended':
      return `Suspended admin access`
    case 'reactivated':
      return `Reactivated admin access`
    default:
      return action
  }
}

// ──────────────────────────────────────────────────────────────
// Permission Category Helpers
// ──────────────────────────────────────────────────────────────

/**
 * Get all permissions grouped by category
 *
 * @returns Object with category names as keys and permission arrays as values
 */
export function getPermissionsByCategory(): Record<string, PermissionKey[]> {
  const categories: Record<string, PermissionKey[]> = {}

  const allPermissions: PermissionKey[] = [
    // User Management
    'users.view',
    'users.edit',
    'users.suspend',
    'users.delete',
    'users.assign_role',
    // Listing Management
    'listings.view',
    'listings.edit',
    'listings.delete',
    'listings.publish',
    'listings.unpublish',
    // Disputes
    'disputes.view',
    'disputes.resolve',
    'disputes.appeal',
    // Support
    'support.manage_tickets',
    'support.respond',
    // Reports
    'reports.view',
    'reports.generate',
    'reports.export',
    // Payments
    'payments.view',
    'payments.refund',
    'payments.manage_fees',
    // Settings
    'settings.admin',
    'settings.system',
    'audit.view',
    'audit.export',
    // Roles
    'roles.view',
    'roles.create',
    'roles.edit',
    'roles.delete',
  ]

  allPermissions.forEach((permission) => {
    const metadata = require('@/lib/types/roles').PERMISSION_METADATA[permission]
    if (metadata) {
      const category = metadata.category
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(permission)
    }
  })

  return categories
}

// ──────────────────────────────────────────────────────────────
// Middleware Helpers
// ──────────────────────────────────────────────────────────────

/**
 * Create error response for permission denied
 *
 * @param permission Permission that was denied
 * @returns API error response
 */
export function permissionDeniedError(permission?: PermissionKey) {
  return {
    success: false,
    error: 'PERMISSION_DENIED',
    message: permission
      ? `User lacks required permission: ${permission}`
      : 'User does not have admin access',
    status: 403,
  }
}

/**
 * Create error response for admin access required
 *
 * @returns API error response
 */
export function adminAccessRequiredError() {
  return {
    success: false,
    error: 'ADMIN_ACCESS_REQUIRED',
    message: 'This action requires admin access',
    status: 403,
  }
}
