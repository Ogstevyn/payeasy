/**
 * Authentication & Authorization Exports
 */

export { stellar } from './stellar-auth'
export {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  checkPermission,
  getRolePermissions,
  createAuthorizationContext,
  getRoleMetadata,
  getRoleLabel,
  canManageRole,
  validateRoleAssignment,
  formatAuditAction,
  getPermissionsByCategory,
  permissionDeniedError,
  adminAccessRequiredError,
} from './roles'

export type { AuthorizationResult } from './middleware/authorization'
