/**
 * Migration for admin role-based access control system
 * Creates admin_users and role_audits tables
 *
 * To apply:
 * 1. Copy to supabase/migrations/ folder
 * 2. Run: supabase migration up
 * Or use Supabase dashboard to execute SQL
 */

-- ──────────────────────────────────────────────────────────────
-- Admin Users Table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Role assignment
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'moderator', 'support', 'analyst', 'custom')),
  custom_permissions TEXT[] DEFAULT NULL,  -- JSON array of permission keys for custom roles

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

  -- Audit trail
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Indexes
  CONSTRAINT admin_users_role_check CHECK (
    (role != 'custom') OR (custom_permissions IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS admin_users_status ON admin_users(status);
CREATE INDEX IF NOT EXISTS admin_users_created_at ON admin_users(created_at);

-- ──────────────────────────────────────────────────────────────
-- Role Audit Log Table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS role_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,

  -- Action type
  action TEXT NOT NULL CHECK (
    action IN ('created', 'updated', 'deleted', 'suspended', 'reactivated')
  ),

  -- Role changes
  old_role TEXT DEFAULT NULL,
  new_role TEXT DEFAULT NULL,
  old_permissions TEXT[] DEFAULT NULL,
  new_permissions TEXT[] DEFAULT NULL,

  -- Who made the change
  changed_by UUID NOT NULL REFERENCES users(id),
  reason TEXT DEFAULT NULL,

  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS role_audits_admin_user_id ON role_audits(admin_user_id);
CREATE INDEX IF NOT EXISTS role_audits_changed_by ON role_audits(changed_by);
CREATE INDEX IF NOT EXISTS role_audits_action ON role_audits(action);
CREATE INDEX IF NOT EXISTS role_audits_timestamp ON role_audits(timestamp DESC);

-- ──────────────────────────────────────────────────────────────
-- Row-Level Security (RLS)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_audits ENABLE ROW LEVEL SECURITY;

-- Only super admins can view admin users
CREATE POLICY "admins_view_admin_users" ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role = 'super_admin'
      AND au.status = 'active'
    )
  );

-- Super admins can manage admin users
CREATE POLICY "admins_manage_admin_users" ON admin_users FOR INSERT, UPDATE, DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role = 'super_admin'
      AND au.status = 'active'
    )
  );

-- Admins can view audit logs
CREATE POLICY "admins_view_audit_logs" ON role_audits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.status = 'active'
    )
  );

-- System inserts audit logs
CREATE POLICY "insert_audit_logs" ON role_audits FOR INSERT
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────
-- Helper Function: Update admin_users timestamp
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_admin_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_users_update_timestamp
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_admin_users_timestamp();

-- ──────────────────────────────────────────────────────────────
-- Helper Function: Audit role changes
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'suspended' AND NEW.status = 'active' THEN
      action_type := 'reactivated';
    ELSIF NEW.status = 'suspended' AND OLD.status != 'suspended' THEN
      action_type := 'suspended';
    ELSIF NEW.role != OLD.role THEN
      action_type := 'updated';
    ELSE
      action_type := 'updated';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
  END IF;

  -- Insert audit log (only if not in test)
  IF current_setting('app.audit_enabled', true) != 'false' THEN
    INSERT INTO role_audits (
      admin_user_id,
      action,
      old_role,
      new_role,
      old_permissions,
      new_permissions,
      changed_by
    ) VALUES (
      COALESCE(NEW.id, OLD.id),
      action_type,
      OLD.role,
      NEW.role,
      OLD.custom_permissions,
      NEW.custom_permissions,
      auth.uid()
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_role_changes
AFTER INSERT OR UPDATE OR DELETE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION audit_role_change();
