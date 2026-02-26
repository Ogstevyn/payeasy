/**
 * @file types/roles.ts
 * @description Role-based access control (RBAC) type definitions and constants.
 *
 * Architecture:
 * - Roles define job responsibilities
 * - Permissions define specific actions
 * - AdminUser links users to roles
 * - RoleAudit tracks changes for compliance
 */

// ──────────────────────────────────────────────────────────────
// Role Definitions
// ──────────────────────────────────────────────────────────────

/**
 * Admin role types
 *
 * - `super_admin`: Full system access, can manage everything
 * - `moderator`: Content & user management (listings, disputes, users)
 * - `support`: Help tickets & customer support
 * - `analyst`: Read-only access to analytics & reports
 * - `custom`: Custom role with specific permissions
 */
export type AdminRole = 'super_admin' | 'moderator' | 'support' | 'analyst' | 'custom'

/**
 * All available permissions in the system
 */
export type PermissionKey =
  // User management
  | 'users.view'
  | 'users.edit'
  | 'users.suspend'
  | 'users.delete'
  | 'users.assign_role'

  // Listing management
  | 'listings.view'
  | 'listings.edit'
  | 'listings.delete'
  | 'listings.publish'
  | 'listings.unpublish'

  // Disputes & Conflicts
  | 'disputes.view'
  | 'disputes.resolve'
  | 'disputes.appeal'

  // Support & Reports
  | 'support.manage_tickets'
  | 'support.respond'
  | 'reports.view'
  | 'reports.generate'
  | 'reports.export'

  // Financial
  | 'payments.view'
  | 'payments.refund'
  | 'payments.manage_fees'

  // Settings
  | 'settings.admin'
  | 'settings.system'
  | 'audit.view'
  | 'audit.export'

  // Roles & Permissions
  | 'roles.view'
  | 'roles.create'
  | 'roles.edit'
  | 'roles.delete'

// ──────────────────────────────────────────────────────────────
// Permission Matrix
// ──────────────────────────────────────────────────────────────

/**
 * Permission matrix defining which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<AdminRole, PermissionKey[]> = {
  super_admin: [
    // All permissions
    'users.view',
    'users.edit',
    'users.suspend',
    'users.delete',
    'users.assign_role',
    'listings.view',
    'listings.edit',
    'listings.delete',
    'listings.publish',
    'listings.unpublish',
    'disputes.view',
    'disputes.resolve',
    'disputes.appeal',
    'support.manage_tickets',
    'support.respond',
    'reports.view',
    'reports.generate',
    'reports.export',
    'payments.view',
    'payments.refund',
    'payments.manage_fees',
    'settings.admin',
    'settings.system',
    'audit.view',
    'audit.export',
    'roles.view',
    'roles.create',
    'roles.edit',
    'roles.delete',
  ],

  moderator: [
    'users.view',
    'users.edit',
    'users.suspend',
    'listings.view',
    'listings.edit',
    'listings.delete',
    'listings.publish',
    'listings.unpublish',
    'disputes.view',
    'disputes.resolve',
    'support.manage_tickets',
    'support.respond',
    'reports.view',
    'audit.view',
    'roles.view',
  ],

  support: [
    'users.view',
    'disputes.view',
    'disputes.resolve',
    'support.manage_tickets',
    'support.respond',
    'reports.view',
    'audit.view',
  ],

  analyst: [
    'users.view',
    'listings.view',
    'disputes.view',
    'reports.view',
    'reports.generate',
    'reports.export',
    'audit.view',
    'roles.view',
  ],

  custom: [
    // Custom roles are configured per instance
  ],
}

// ──────────────────────────────────────────────────────────────
// Admin User Record
// ──────────────────────────────────────────────────────────────

/** Database row for admin users */
export interface AdminUserRow {
  id: string
  user_id: string
  role: AdminRole
  custom_permissions?: PermissionKey[] | null
  assigned_at: string
  assigned_by: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

/** Domain-layer admin user */
export interface AdminUser {
  id: string
  user_id: string
  role: AdminRole
  custom_permissions?: PermissionKey[]
  assigned_at: string
  assigned_by: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

/** Admin user with user info */
export interface AdminUserWithUser extends AdminUser {
  user: {
    id: string
    username: string
    email?: string
    avatar_url?: string
  }
}

// ──────────────────────────────────────────────────────────────
// Role Audit
// ──────────────────────────────────────────────────────────────

/**
 * Audit log entry for role changes
 * Ensures compliance and traceability
 */
export interface RoleAuditRow {
  id: string
  admin_user_id: string
  action: 'created' | 'updated' | 'deleted' | 'suspended' | 'reactivated'
  old_role?: AdminRole | null
  new_role?: AdminRole | null
  old_permissions?: PermissionKey[] | null
  new_permissions?: PermissionKey[] | null
  changed_by: string
  reason?: string | null
  timestamp: string
}

export interface RoleAudit extends RoleAuditRow {}

// ──────────────────────────────────────────────────────────────
// Authorization Context
// ──────────────────────────────────────────────────────────────

/**
 * Authorization context for API routes and middleware
 */
export interface AuthorizationContext {
  user_id: string
  admin_id?: string
  role?: AdminRole
  permissions: PermissionKey[]
  is_admin: boolean
  is_super_admin: boolean
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  required_permission: PermissionKey
  user_has_permission: boolean
}

// ──────────────────────────────────────────────────────────────
// Role Metadata
// ──────────────────────────────────────────────────────────────

/**
 * Human-readable metadata for roles
 */
export const ROLE_METADATA: Record<
  AdminRole,
  {
    label: string
    description: string
    color: string
    icon: string
  }
> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access, can manage everything',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    icon: '👑',
  },
  moderator: {
    label: 'Moderator',
    description: 'Content and user management',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    icon: '🛡️',
  },
  support: {
    label: 'Support Agent',
    description: 'Help tickets and customer support',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    icon: '🎧',
  },
  analyst: {
    label: 'Analyst',
    description: 'Read-only access to reports and analytics',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
    icon: '📊',
  },
  custom: {
    label: 'Custom',
    description: 'Custom permissions',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
    icon: '⚙️',
  },
}

// ──────────────────────────────────────────────────────────────
// Permission Metadata
// ──────────────────────────────────────────────────────────────

export const PERMISSION_METADATA: Record<
  PermissionKey,
  {
    label: string
    description: string
    category: string
  }
> = {
  // User Management
  'users.view': {
    label: 'View Users',
    description: 'View user profiles and information',
    category: 'User Management',
  },
  'users.edit': {
    label: 'Edit Users',
    description: 'Edit user profiles and information',
    category: 'User Management',
  },
  'users.suspend': {
    label: 'Suspend Users',
    description: 'Suspend or ban user accounts',
    category: 'User Management',
  },
  'users.delete': {
    label: 'Delete Users',
    description: 'Permanently delete user accounts',
    category: 'User Management',
  },
  'users.assign_role': {
    label: 'Assign Roles',
    description: 'Assign or change admin roles',
    category: 'User Management',
  },

  // Listing Management
  'listings.view': {
    label: 'View Listings',
    description: 'View all listings',
    category: 'Listing Management',
  },
  'listings.edit': {
    label: 'Edit Listings',
    description: 'Edit listing details',
    category: 'Listing Management',
  },
  'listings.delete': {
    label: 'Delete Listings',
    description: 'Delete listings',
    category: 'Listing Management',
  },
  'listings.publish': {
    label: 'Publish Listings',
    description: 'Publish listings to public',
    category: 'Listing Management',
  },
  'listings.unpublish': {
    label: 'Unpublish Listings',
    description: 'Unpublish or archive listings',
    category: 'Listing Management',
  },

  // Disputes
  'disputes.view': {
    label: 'View Disputes',
    description: 'View dispute tickets',
    category: 'Disputes',
  },
  'disputes.resolve': {
    label: 'Resolve Disputes',
    description: 'Resolve or close disputes',
    category: 'Disputes',
  },
  'disputes.appeal': {
    label: 'Appeal Disputes',
    description: 'Review appeals for disputes',
    category: 'Disputes',
  },

  // Support
  'support.manage_tickets': {
    label: 'Manage Support Tickets',
    description: 'Create and manage support tickets',
    category: 'Support',
  },
  'support.respond': {
    label: 'Respond to Tickets',
    description: 'Respond to customer support tickets',
    category: 'Support',
  },

  // Reports
  'reports.view': {
    label: 'View Reports',
    description: 'View analytics and reports',
    category: 'Reports',
  },
  'reports.generate': {
    label: 'Generate Reports',
    description: 'Generate custom reports',
    category: 'Reports',
  },
  'reports.export': {
    label: 'Export Reports',
    description: 'Export report data',
    category: 'Reports',
  },

  // Payments
  'payments.view': {
    label: 'View Payments',
    description: 'View payment history',
    category: 'Payments',
  },
  'payments.refund': {
    label: 'Process Refunds',
    description: 'Issue refunds to users',
    category: 'Payments',
  },
  'payments.manage_fees': {
    label: 'Manage Fees',
    description: 'Configure payment fees',
    category: 'Payments',
  },

  // Settings
  'settings.admin': {
    label: 'Admin Settings',
    description: 'Change admin panel settings',
    category: 'Settings',
  },
  'settings.system': {
    label: 'System Settings',
    description: 'Change system-wide settings',
    category: 'Settings',
  },
  'audit.view': {
    label: 'View Audit Logs',
    description: 'View system audit logs',
    category: 'Audit',
  },
  'audit.export': {
    label: 'Export Audit Logs',
    description: 'Export audit log data',
    category: 'Audit',
  },

  // Roles
  'roles.view': {
    label: 'View Roles',
    description: 'View role definitions',
    category: 'Roles & Permissions',
  },
  'roles.create': {
    label: 'Create Roles',
    description: 'Create new custom roles',
    category: 'Roles & Permissions',
  },
  'roles.edit': {
    label: 'Edit Roles',
    description: 'Edit role permissions',
    category: 'Roles & Permissions',
  },
  'roles.delete': {
    label: 'Delete Roles',
    description: 'Delete custom roles',
    category: 'Roles & Permissions',
  },
}
