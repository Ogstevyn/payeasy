/**
 * @file /api/admin/roles/route.ts
 * @description API endpoints for role management
 * - GET: List all admin users with their roles
 * - POST: Assign role to a user
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  hasPermission,
  validateRoleAssignment,
  createAuthorizationContext,
  permissionDeniedError,
  adminAccessRequiredError,
} from '@/lib/auth/roles'
import type { AdminRole } from '@/lib/types/roles'

// ──────────────────────────────────────────────────────────────
// GET /api/admin/roles - List admin users
// ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get current user from auth header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    const token = authHeader.substring(7)
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    // Check if current user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .single()

    if (adminError || !adminData) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    const context = createAuthorizationContext(adminData)

    // Check permission
    if (!hasPermission(context, 'roles.view')) {
      return NextResponse.json(permissionDeniedError('roles.view'), { status: 403 })
    }

    // Fetch all admin users with user info
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select(
        `
        *,
        user:users(id, username, email, avatar_url)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin users:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch admin users' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: adminUsers,
      total: adminUsers.length,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/roles:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ──────────────────────────────────────────────────────────────
// POST /api/admin/roles - Assign role to user
// ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
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
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    // Check if current user is admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .single()

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return NextResponse.json(permissionDeniedError('users.assign_role'), { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { user_id, role, custom_permissions, reason } = body

    if (!user_id || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id, role' },
        { status: 400 },
      )
    }

    // Validate role
    if (!['super_admin', 'moderator', 'support', 'analyst', 'custom'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    // Check if user exists
    const { data: user } = await supabase.from('users').select('id').eq('id', user_id).single()

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Check if already admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user_id)
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'User is already an admin' },
        { status: 400 },
      )
    }

    // Create admin record
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id,
        role: role as AdminRole,
        custom_permissions:
          role === 'custom' && custom_permissions ? custom_permissions : null,
        assigned_by: userData.user.id,
        status: 'active',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating admin user:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to assign role' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: newAdmin,
        message: `User assigned role: ${role}`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error in POST /api/admin/roles:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
