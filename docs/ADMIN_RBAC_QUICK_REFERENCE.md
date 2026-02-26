# Admin RBAC - Quick Reference

Fast lookup guide for the admin role-based access control system.

## 5-Minute Setup

### 1. Add First Super Admin (One-time setup)

**Direct Supabase SQL:**
```sql
-- First, ensure user exists in users table
INSERT INTO admin_users (
  user_id,
  role,
  status,
  assigned_at,
  assigned_by
) VALUES (
  'user-uuid-here',
  'super_admin',
  'active',
  NOW(),
  'user-uuid-here'
);
```

### 2. Use in Component

```tsx
import { AdminRoleManager } from '@/components/admin/AdminRoleManager'

export function AdminPage() {
  return <AdminRoleManager />
}
```

### 3. Use in API Route

```tsx
import { authorizeRequest } from '@/lib/middleware/authorization'

export async function DELETE(request: NextRequest) {
  const auth = await authorizeRequest(request, 'users.delete')
  if (!auth.authorized) return auth.response

  // Delete logic here
}
```

## Permission Quick Lookup

| Permission | Role | Use Case |
|-----------|------|----------|
| `users.view` | Moderator, Analyst | View user profiles |
| `users.delete` | Super Admin, Moderator | Delete user account |
| `listings.delete` | Super Admin, Moderator | Delete listing |
| `disputes.resolve` | Super Admin, Moderator, Support | Resolve conflict |
| `reports.generate` | Super Admin, Analyst | Create custom report |
| `audit.view` | All admin roles | View audit logs |
| `users.assign_role` | Super Admin only | Assign admin role |

## Role Comparison

```
Super Admin    ███████████████████ Full Access
Moderator      ███████████         Content Control
Support        █████                Help Tickets
Analyst        ███                  Read-Only Reports
Custom         ██                   Flexible
```

## Code Patterns

### Pattern 1: Protecting Endpoints

```tsx
// lib/auth/example.ts
import { authorizeRequest } from '@/lib/middleware/authorization'

export async function GET(request: NextRequest) {
  // Check single permission
  const auth = await authorizeRequest(request, 'users.view')
  if (!auth.authorized) return auth.response

  // Proceed with auth.context containing:
  // - user_id
  // - admin_id
  // - role ('super_admin' | 'moderator' | 'support' | 'analyst' | 'custom')
  // - permissions (array of PermissionKey)
  // - is_admin (boolean)
  // - is_super_admin (boolean)
}
```

### Pattern 2: Conditional UI

```tsx
// components/UserDeleteButton.tsx
import { PermissionGuard } from '@/components/admin/PermissionGuard'

export function UserDeleteButton({ context, userId }) {
  return (
    <PermissionGuard
      context={context}
      permission="users.delete"
      fallback={<DisabledButton>Access Denied</DisabledButton>}
    >
      <button onClick={() => deleteUser(userId)}>Delete</button>
    </PermissionGuard>
  )
}
```

### Pattern 3: Hook-Based Checking

```tsx
// components/FeatureToggle.tsx
import { usePermission } from '@/components/admin/PermissionGuard'

export function FeatureToggle({ context }) {
  const { has, isAdmin } = usePermission(context)

  if (!isAdmin) return null
  if (has('reports.generate')) return <GenerateReportBtn />
  if (has('reports.view')) return <ViewReportsBtn />
  return <ReportsDisabled />
}
```

### Pattern 4: Multiple Permission Checks

```tsx
// Check ALL permissions (AND logic)
const auth = await requireAllPermissions(request, [
  'users.view',
  'users.delete',
])

// Check ANY permission (OR logic)
const auth = await requireAnyPermission(request, [
  'reports.generate',
  'reports.export',
])

// Check role
const auth = await requireSuperAdminAccess(request)
```

## Admin Role Matrix

```
╔════════════╦════════════╦══════════╦═════════╦════════╗
║ Permission ║ Super Admin║ Moderator║ Support║Analyst ║
╠════════════╬════════════╬══════════╬═════════╬════════╣
║ users.*    ║     ✅     ║    ✅    ║   ✓    ║   ❌   ║
║ listings.* ║     ✅     ║    ✅    ║   ❌   ║   ✓    ║
║ disputes.* ║     ✅     ║    ✅    ║   ✓    ║   ❌   ║
║ support.*  ║     ✅     ║    ✅    ║   ✅   ║   ❌   ║
║ reports.*  ║     ✅     ║    ✓    ║   ❌   ║   ✅   ║
║ settings.* ║     ✅     ║    ❌    ║   ❌   ║   ❌   ║
║ roles.*    ║     ✅     ║    ❌    ║   ❌   ║   ❌   ║
║ audit.*    ║     ✅     ║    ✓    ║   ❌   ║   ✓    ║
╚════════════╩════════════╩══════════╩═════════╩════════╝

✅ = Full access
✓ = View only
❌ = No access
```

## Common Tasks

### Assign Role to User

```tsx
async function assignRole(userId: string, role: AdminRole) {
  const response = await fetch('/api/admin/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, role })
  })
  return response.json()
}
```

### Remove Admin Access

```tsx
async function removeAdmin(adminId: string) {
  const response = await fetch(`/api/admin/roles/${adminId}`, {
    method: 'DELETE'
  })
  return response.json()
}
```

### Update Admin Role

```tsx
async function updateAdminRole(adminId: string, role: AdminRole) {
  const response = await fetch(`/api/admin/roles/${adminId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  })
  return response.json()
}
```

### View Admins

```tsx
async function listAdmins() {
  const response = await fetch('/api/admin/roles')
  const data = await response.json()
  return data.data // Array of admin users
}
```

### Check Audit Log

```tsx
async function getAuditLogs(page = 1, limit = 50) {
  const response = await fetch(
    `/api/admin/audit-logs?page=${page}&limit=${limit}`
  )
  return response.json()
}
```

## Error Handling

```tsx
try {
  const auth = await authorizeRequest(request, 'users.delete')
  if (!auth.authorized) {
    return auth.response // Returns 403 with error message
  }
  // Process request
} catch (error) {
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Debugging

### Check if User is Admin

```tsx
const { data } = await supabase
  .from('admin_users')
  .select('*')
  .eq('user_id', userId)
  .single()

console.log('Admin?', !!data)
console.log('Role:', data?.role)
console.log('Status:', data?.status)
```

### Check Audit Log

```tsx
const { data } = await supabase
  .from('role_audits')
  .select('*')
  .eq('admin_user_id', adminId)
  .order('timestamp', { ascending: false })
  .limit(10)

data.forEach(log => {
  console.log(`${log.action}: ${log.old_role} → ${log.new_role}`)
})
```

## API Response Examples

### GET `/api/admin/roles` - List Admins

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400",
      "user_id": "660e8500",
      "role": "super_admin",
      "status": "active",
      "assigned_at": "2026-02-20T10:00:00Z",
      "user": {
        "username": "alice",
        "email": "alice@example.com"
      }
    }
  ]
}
```

### POST `/api/admin/roles` - Assign Role

```json
{
  "success": true,
  "message": "User assigned role: moderator",
  "data": {
    "id": "550e8401",
    "user_id": "660e8501",
    "role": "moderator",
    "status": "active",
    "assigned_at": "2026-02-25T10:30:00Z"
  }
}
```

### GET `/api/admin/audit-logs` - View Changes

```json
{
  "success": true,
  "data": [
    {
      "id": "770e8600",
      "admin_user_id": "550e8400",
      "action": "created",
      "new_role": "moderator",
      "changed_by": "660e8500",
      "timestamp": "2026-02-25T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 150,
    "pages": 8
  }
}
```

## What's Protected?

✅ **API Routes** - Check permissions before processing
✅ **UI Components** - Hide/disable based on permissions
✅ **Database** - RLS policies enforce access control
✅ **Audit Trail** - All changes logged automatically
✅ **Privileg Escalation** - Prevented by role hierarchy

## What's NOT Protected?

⚠️ **Client-side checks** - Can be bypassed, always verify on server
⚠️ **Hidden UI** - Still send API requests if determined
⚠️ **Component rendering** - Guards check permissions, they don't prevent action

**Always verify permissions on the server-side API routes!**

## Checklist for New Feature

- [ ] Define required permission
- [ ] Check permission in API route
- [ ] Wrap UI with PermissionGuard
- [ ] Test as different roles
- [ ] Add to audit log if needed
- [ ] Document in role matrix

## Key Files

| File | Purpose |
|------|---------|
| `lib/types/roles.ts` | All type definitions and constants |
| `lib/auth/roles.ts` | Permission checking utilities |
| `lib/middleware/authorization.ts` | API route protection |
| `components/admin/AdminRoleManager.tsx` | UI for managing roles |
| `components/admin/AuditLogViewer.tsx` | View audit trail |
| `components/admin/PermissionGuard.tsx` | Conditional rendering |
| `app/api/admin/roles/route.ts` | Role management API |
| `supabase/migrations/20260225_create_admin_rbac.sql` | Database setup |

## Support Questions

**Q: How do I create a super admin?**
A: Use Supabase SQL to insert into `admin_users` with role='super_admin'

**Q: Can I modify built-in roles?**
A: No, use custom roles for flexible permissions

**Q: How are role changes tracked?**
A: Automatically in `role_audits` table with full audit trail

**Q: What's the permission hierarchy?**
A: Super Admin > Moderator > Custom (30) > Support > Analyst

**Q: Can admins remove themselves?**
A: No, protected by `canManageRole` logic
