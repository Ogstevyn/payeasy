# Role-Based Access Control (RBAC) System

Complete admin role management system with granular permissions, audittrailing, and privilege escalation prevention.

## Overview

The RBAC system provides:
- **4 built-in admin roles** with predefined permissions
- **30+ granular permissions** across different categories
- **Privilege escalation prevention** through role hierarchy
- **Complete audit trail** for compliance
- **Custom roles** with flexible permission assignment
- **Easy-to-use management UI**

## Quick Start

### 1. Assign a Role to User

**API:**
```bash
POST /api/admin/roles
Content-Type: application/json
Authorization: Bearer {token}

{
  "user_id": "user-uuid",
  "role": "moderator"
}
```

**Component:**
```tsx
import { AdminRoleManager } from '@/components/admin/AdminRoleManager'

export function AdminPanel() {
  return <AdminRoleManager />
}
```

### 2. Check Permissions in Code

```tsx
import { hasPermission } from '@/lib/auth/roles'
import type { AuthorizationContext } from '@/lib/types/roles'

if (hasPermission(context, 'users.delete')) {
  // User can delete users
}
```

### 3. Protect API Routes

```tsx
import { authorizeRequest } from '@/lib/middleware/authorization'

export async function POST(request: NextRequest) {
  const auth = await authorizeRequest(request, 'users.delete')
  if (!auth.authorized) {
    return auth.response
  }

  // Delete user logic
}
```

### 4. Conditional UI Rendering

```tsx
import { PermissionGuard } from '@/components/admin/PermissionGuard'

<PermissionGuard context={auth} permission="users.delete">
  <DeleteButton />
</PermissionGuard>
```

## Admin Roles

### Super Admin 👑
- **Level**: 100 (highest)
- **Access**: Full system access
- **Use case**: System owners, top administrators
- **Permissions**: All (28 permissions)

```tsx
{
  role: 'super_admin',
  custom_permissions: null
}
```

### Moderator 🛡️
- **Level**: 60
- **Access**: Content and user management
- **Use case**: Community managers, content moderators
- **Permissions**: 15 permissions
  - User management (view, edit, suspend)
  - Listing management (view, edit, delete, publish)
  - Disputes (view, resolve)
  - Support tickets
  - Reports
  - Audit logs

### Support Agent 🎧
- **Level**: 40
- **Access**: Customer support and help
- **Use case**: Support team, customer service
- **Permissions**: 7 permissions
  - User view
  - Support ticket management
  - Dispute viewing
  - Reports

### Analyst 📊
- **Level**: 20
- **Access**: Read-only analytics
- **Use case**: Data analysts, report generators
- **Permissions**: 8 permissions
  - View-only: Users, Listings, Disputes, Payments
  - Generate and export reports
  - View audit logs

### Custom ⚙️
- **Level**: 30
- **Access**: Custom permissions per admin
- **Use case**: Specialized roles
- **Permissions**: Admin-defined

## Permission Categories

### Users (5 permissions)
- `users.view` - View user profiles
- `users.edit` - Edit user information
- `users.suspend` - Suspend/ban accounts
- `users.delete` - Delete user accounts
- `users.assign_role` - Assign admin roles

### Listings (5 permissions)
- `listings.view` - View listings
- `listings.edit` - Edit listings
- `listings.delete` - Delete listings
- `listings.publish` - Publish to public
- `listings.unpublish` - Unpublish listings

### Disputes (3 permissions)
- `disputes.view` - View disputes
- `disputes.resolve` - Resolve disputes
- `disputes.appeal` - Review appeals

### Support (2 permissions)
- `support.manage_tickets` - Create/manage tickets
- `support.respond` - Respond to tickets

### Reports (3 permissions)
- `reports.view` - View reports
- `reports.generate` - Generate custom reports
- `reports.export` - Export data

### Payments (3 permissions)
- `payments.view` - View payment history
- `payments.refund` - Process refunds
- `payments.manage_fees` - Configure fees

### Settings (4 permissions)
- `settings.admin` - Admin panel settings
- `settings.system` - System settings
- `audit.view` - View audit logs
- `audit.export` - Export audit logs

### Roles (4 permissions)
- `roles.view` - View role definitions
- `roles.create` - Create custom roles
- `roles.edit` - Edit roles
- `roles.delete` - Delete roles

## API Endpoints

### Manage Admin Roles

**List all admins:**
```bash
GET /api/admin/roles
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "admin-uuid",
      "user_id": "user-uuid",
      "role": "moderator",
      "status": "active",
      "assigned_at": "2026-02-25T...",
      "user": {
        "username": "john_doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Assign role:**
```bash
POST /api/admin/roles
Content-Type: application/json
Authorization: Bearer {token}

{
  "user_id": "user-uuid",
  "role": "moderator",
  "custom_permissions": null
}

Response:
{
  "success": true,
  "data": { /* admin record */ }
}
```

**Update role:**
```bash
PATCH /api/admin/roles/{admin_id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "role": "support",
  "status": "suspended",
  "reason": "Investigation needed"
}
```

**Remove admin:**
```bash
DELETE /api/admin/roles/{admin_id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Admin access removed"
}
```

### Audit Logs

**View audit logs:**
```bash
GET /api/admin/audit-logs?page=1&limit=20&action=created
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "log-uuid",
      "admin_user_id": "admin-uuid",
      "action": "created",
      "new_role": "moderator",
      "changed_by": "super-admin-id",
      "timestamp": "2026-02-25T...",
      "admin_user": {
        "user": { "username": "jane_smith" }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Authorization Middleware

### Basic Permission Check

```tsx
export async function POST(request: NextRequest) {
  const auth = await authorizeRequest(request, 'users.delete')

  if (!auth.authorized) {
    return auth.response
  }

  // Use auth.context for user info
  console.log(auth.context?.role)
  console.log(auth.userId)
}
```

### Multiple Permissions

```tsx
// Require ALL permissions
const auth = await requireAllPermissions(request, [
  'users.delete',
  'audit.view'
])

// Require ANY permission
const auth = await requireAnyPermission(request, [
  'users.delete',
  'listings.delete'
])
```

### Role Checks

```tsx
// Require super admin
const auth = await requireSuperAdminAccess(request)

// Require any admin
const auth = await requireAdminAccess(request)
```

## Permission Guard Components

### PermissionGuard

Hide content if user lacks permission:

```tsx
<PermissionGuard context={auth} permission="users.delete">
  <DeleteButton />
</PermissionGuard>
```

### RoleGuard

Show only to specific roles:

```tsx
<RoleGuard context={auth} roles={['super_admin', 'moderator']}>
  <ContentModerationPanel />
</RoleGuard>
```

### AdminGuard

Show only to admins:

```tsx
<AdminGuard context={auth}>
  <AdminToolbar />
</AdminGuard>
```

### SuperAdminGuard

Show only to super admins:

```tsx
<SuperAdminGuard context={auth}>
  <SystemSettings />
</SuperAdminGuard>
```

### usePermission Hook

Check permissions in component logic:

```tsx
const { has, hasAll, hasAny, isAdmin, isSuperAdmin } = usePermission(auth)

if (has('users.delete')) {
  // Can delete
}

if (hasAll(['users.delete', 'audit.view'])) {
  // Can do both
}
```

## Database Schema

### admin_users Table

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  role TEXT NOT NULL,
  custom_permissions TEXT[],
  status TEXT DEFAULT 'active',
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### role_audits Table

```sql
CREATE TABLE role_audits (
  id UUID PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_role TEXT,
  new_role TEXT,
  old_permissions TEXT[],
  new_permissions TEXT[],
  changed_by UUID NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Privilege Escalation Prevention

The system prevents privilege escalation through:

1. **Role Hierarchy**: Each role has a level (super_admin=100, moderator=60, etc.)
2. **Escalation Check**: Users can only manage roles below their level
3. **Super Admin Exception**: Super admins can manage any role
4. **Self-Protection**: Admins cannot remove their own access

```tsx
// This fails - regular admin can't assign super_admin role
canManageRole('moderator', 'super_admin') // false

// This succeeds - super admin can assign any role
canManageRole('super_admin', 'moderator') // true
```

## Audit Trail

All role changes are automatically logged:

- **Action Types**: created, updated, deleted, suspended, reactivated
- **Tracked Fields**: Role changes, permission changes, who made the change
- **Query Support**: Filter by admin, action type, date range
- **Compliance**: Full history for regulatory requirements

Example audit entry:

```json
{
  "id": "audit-uuid",
  "admin_user_id": "admin-uuid",
  "action": "updated",
  "old_role": "analyst",
  "new_role": "moderator",
  "changed_by": "super-admin-id",
  "reason": "Promotion after performance review",
  "timestamp": "2026-02-25T10:30:00Z"
}
```

## Custom Roles

Create custom roles with specific permissions:

```tsx
// Via API
POST /api/admin/roles
{
  "user_id": "user-uuid",
  "role": "custom",
  "custom_permissions": [
    "reports.view",
    "reports.generate",
    "audit.view"
  ]
}
```

## Best Practices

### 1. Principle of Least Privilege
Assign the minimum necessary permissions:
```tsx
// ✅ Good - analyst role for report viewers
role: 'analyst'

// ❌ Bad - super admin for basic access
role: 'super_admin'
```

### 2. Regular Audits
Review audit logs regularly:
```tsx
<AuditLogViewer limit={100} />
```

### 3. Permission Checks at Multiple Levels
```tsx
// API route level
const auth = await authorizeRequest(request, 'users.delete')

// Business logic level
if (!hasPermission(context, 'users.delete')) {
  throw new Error('Insufficient permissions')
}

// UI level
<PermissionGuard context={auth} permission="users.delete">
  <DeleteButton />
</PermissionGuard>
```

### 4. Log Important Actions
```tsx
// Log role assignments
INSERT INTO role_audits (action, changed_by, reason)
VALUES ('created', userId, 'New moderator for region X')
```

## Testing

### Unit Tests

```tsx
import { hasPermission, canManageRole } from '@/lib/auth/roles'

test('super admin has all permissions', () => {
  const context = {
    permissions: ALL_PERMISSIONS,
    role: 'super_admin'
  }
  expect(hasPermission(context, 'users.delete')).toBe(true)
})

test('analyst cannot delete users', () => {
  const context = {
    permissions: ['reports.view'],
    role: 'analyst'
  }
  expect(hasPermission(context, 'users.delete')).toBe(false)
})
```

### Integration Tests

```tsx
test('super admin can assign any role', async () => {
  const response = await fetch('/api/admin/roles', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${superAdminToken}` },
    body: JSON.stringify({
      user_id: userId,
      role: 'moderator'
    })
  })
  expect(response.status).toBe(201)
})

test('moderator cannot assign super admin', async () => {
  const response = await fetch('/api/admin/roles', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${moderatorToken}` },
    body: JSON.stringify({
      user_id: userId,
      role: 'super_admin'
    })
  })
  expect(response.status).toBe(403)
})
```

## Migration

To apply the database changes:

```bash
# Via Supabase CLI
supabase migration up

# Or manually run the SQL
# See: supabase/migrations/20260225_create_admin_rbac.sql
```

## Files

- **Types**: `lib/types/roles.ts` - All type definitions
- **Utilities**: `lib/auth/roles.ts` - Permission checking functions
- **Middleware**: `lib/middleware/authorization.ts` - Route protection
- **API**: `app/api/admin/` - Role management endpoints
- **Components**: `components/admin/` - UI components
- **Migrations**: `supabase/migrations/20260225_create_admin_rbac.sql` - Database schema

## Troubleshooting

### "User is not an admin"
- Check if user has an `admin_users` record
- Verify status is 'active' (not suspended/inactive)

### "Permission denied"
- Check assigned role using `/api/admin/roles`
- Verify permission is in role's permission array
- Check admin status

### Audit logs not showing
- Verify `audit.view` permission
- Check time filters in API query

## Support

For issues or questions:
1. Check role assignments in `/api/admin/roles`
2. Review audit logs for changes
3. Test permissions with `hasPermission()` function
4. Check middleware authorization results
