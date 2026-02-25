/**
 * @file /api/admin/audit-logs/route.ts
 * @description API endpoint for viewing audit logs
 * - GET: List role change audit logs with filtering
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  hasPermission,
  createAuthorizationContext,
  permissionDeniedError,
  adminAccessRequiredError,
} from '@/lib/auth/roles'

// ──────────────────────────────────────────────────────────────
// GET /api/admin/audit-logs - List audit logs
// ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
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

    // Check if current user is admin with audit.view permission
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .single()

    if (!adminData) {
      return NextResponse.json(adminAccessRequiredError(), { status: 403 })
    }

    const context = createAuthorizationContext(adminData)

    // Check permission
    if (!hasPermission(context, 'audit.view')) {
      return NextResponse.json(permissionDeniedError('audit.view'), { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const admin_id = searchParams.get('admin_id')
    const action = searchParams.get('action')

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('role_audits')
      .select(
        `
        *,
        admin_user:admin_users(user_id, user:users(username, email)),
        changed_by_user:users!role_audits_changed_by_fkey(username, email)
      `,
        { count: 'exact' },
      )
      .order('timestamp', { ascending: false })

    // Apply filters
    if (admin_id) {
      query = query.eq('admin_user_id', admin_id)
    }

    if (action) {
      query = query.eq('action', action)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching audit logs:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch audit logs' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/admin/audit-logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
