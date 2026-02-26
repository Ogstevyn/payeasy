/**
 * @file middleware/authorization.ts
 * @description Authorization middleware for checking admin permissions on API routes
 *
 * Usage:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const auth = await authorizeRequest(request, 'users.delete')
 *   if (!auth.authorized) {
 *     return auth.response
 *   }
 *   // Proceed with implementation
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  createAuthorizationContext,
  hasPermission,
  adminAccessRequiredError,
  permissionDeniedError,
} from '@/lib/auth/roles'
import type { AuthorizationContext, PermissionKey } from '@/lib/types/roles'

// ──────────────────────────────────────────────────────────────
// Authorization Result
// ──────────────────────────────────────────────────────────────

export interface AuthorizationResult {
  authorized: boolean
  context?: AuthorizationContext
  response?: NextResponse
  userId?: string
  adminId?: string
}

// ──────────────────────────────────────────────────────────────
// Main Authorization Function
// ──────────────────────────────────────────────────────────────

/**
 * Check if request is authorized for a specific permission
 *
 * @param request NextRequest object
 * @param requiredPermission Permission(s) required (can be string or array)
 * @param requireAll If true, user must have ALL permissions. If false, ANY permission.
 * @returns AuthorizationResult with status and context
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const auth = await authorizeRequest(request, 'users.delete')
 *   if (!auth.authorized) {
 *     return auth.response
 *   }
 *   // Proceed - auth.context has user info
 * }
 * ```
 */
export async function authorizeRequest(
  request: NextRequest,
  requiredPermission?: PermissionKey | PermissionKey[],
  requireAll = true,
): Promise<AuthorizationResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Extract authorization token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        authorized: false,
        response: NextResponse.json(adminAccessRequiredError(), { status: 403 }),
      }
    }

    const token = authHeader.substring(7)

    // Get user from token
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return {
        authorized: false,
        response: NextResponse.json(adminAccessRequiredError(), { status: 403 }),
      }
    }

    // Get admin record
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .single()

    if (adminError || !adminData) {
      return {
        authorized: false,
        response: NextResponse.json(adminAccessRequiredError(), { status: 403 }),
        userId: userData.user.id,
      }
    }

    // Create authorization context
    const context = createAuthorizationContext(adminData)

    // Check specific permissions if required
    if (requiredPermission) {
      const permissions = Array.isArray(requiredPermission)
        ? requiredPermission
        : [requiredPermission]

      const hasRequired = requireAll
        ? permissions.every((p) => hasPermission(context, p))
        : permissions.some((p) => hasPermission(context, p))

      if (!hasRequired) {
        return {
          authorized: false,
          response: NextResponse.json(
            permissionDeniedError(permissions[0]),
            { status: 403 },
          ),
          context,
          userId: userData.user.id,
          adminId: adminData.id,
        }
      }
    }

    // Authorization successful
    return {
      authorized: true,
      context,
      userId: userData.user.id,
      adminId: adminData.id,
    }
  } catch (error) {
    console.error('Authorization error:', error)
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 },
      ),
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Convenience Wrappers
// ──────────────────────────────────────────────────────────────

/**
 * Check if user is admin (any admin role)
 */
export async function requireAdminAccess(request: NextRequest): Promise<AuthorizationResult> {
  return authorizeRequest(request)
}

/**
 * Check if user is super admin
 */
export async function requireSuperAdminAccess(request: NextRequest): Promise<AuthorizationResult> {
  const auth = await authorizeRequest(request)

  if (auth.authorized && !auth.context?.is_super_admin) {
    return {
      authorized: false,
      response: NextResponse.json(permissionDeniedError(), { status: 403 }),
      context: auth.context,
      userId: auth.userId,
      adminId: auth.adminId,
    }
  }

  return auth
}

/**
 * Check multiple permissions with AND logic (all must be present)
 */
export async function requireAllPermissions(
  request: NextRequest,
  permissions: PermissionKey[],
): Promise<AuthorizationResult> {
  return authorizeRequest(request, permissions, true)
}

/**
 * Check multiple permissions with OR logic (any must be present)
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissions: PermissionKey[],
): Promise<AuthorizationResult> {
  return authorizeRequest(request, permissions, false)
}

// ──────────────────────────────────────────────────────────────
// Helper: Check Permission in Context
// ──────────────────────────────────────────────────────────────

/**
 * Check if authorization context has permission
 * (useful after authorizeRequest has been called)
 */
export function contextHasPermission(
  context: AuthorizationContext | undefined,
  permission: PermissionKey,
): boolean {
  return context ? hasPermission(context, permission) : false
}
