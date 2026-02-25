/**
 * @file /api/admin/roles/[id]/route.ts
 * @description API endpoints for managing individual admin roles
 * - PATCH: Update admin role
 * - DELETE: Remove admin access
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  validateRoleAssignment,
  createAuthorizationContext,
  permissionDeniedError,
  adminAccessRequiredError,
} from '@/lib/auth/roles'
import type { AdminRole } from '@/lib/types/roles'

// ──────────────────────────────────────────────────────────────
// PATCH /api/admin/roles/[id] - Update admin role
// ──────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get current user
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    const token = authHeader.substring(7)
    const { data: userData } = await supabase.auth.getUser(token)

    if (!userData.user) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    // Check if current user is super admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .single()

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return NextResponse.json(permissionDeniedError('users.assign_role'), { status: 403 })
    }

    // Get target admin
    const { data: targetAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 })
    }

    // Parse request
    const body = await request.json()
    const { role, custom_permissions, status, reason } = body

    // Build update object
    const toUpdate: Record<string, any> = {}

    if (role) {
      if (!['super_admin', 'moderator', 'support', 'analyst', 'custom'].includes(role)) {
        return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
      }
      toUpdate.role = role as AdminRole
    }

    if (custom_permissions !== undefined) {
      toUpdate.custom_permissions = custom_permissions
    }

    if (status) {
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
      }
      toUpdate.status = status
    }

    // Update admin
    const { data: updated, error } = await supabase
      .from('admin_users')
      .update(toUpdate)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating admin:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update admin' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Admin role updated',
    })
  } catch (error) {
    console.error('Error in PATCH /api/admin/roles/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ──────────────────────────────────────────────────────────────
// DELETE /api/admin/roles/[id] - Remove admin access
// ──────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get current user
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    const token = authHeader.substring(7)
    const { data: userData } = await supabase.auth.getUser(token)

    if (!userData.user) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    // Check if current user is super admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .single()

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return NextResponse.json(permissionDeniedError('users.assign_role'), { status: 403 })
    }

    // Prevent deleting self
    const { data: targetAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 })
    }

    if (targetAdmin.user_id === userData.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove your own admin access' },
        { status: 400 },
      )
    }

    // Delete admin record
    const { error } = await supabase.from('admin_users').delete().eq('id', params.id)

    if (error) {
      console.error('Error deleting admin:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove admin' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin access removed',
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/roles/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
