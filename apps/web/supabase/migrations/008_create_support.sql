CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('open', 'triaged', 'assigned', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sla_minutes INTEGER NOT NULL DEFAULT 2880,
  sla_due_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  first_response_at TIMESTAMPTZ,
  resolution_summary TEXT,
  resolved_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user
  ON support_tickets (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_assignee
  ON support_tickets (assigned_agent_id, status);

CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_ticket
  ON support_ticket_comments (ticket_id, created_at);

CREATE TABLE IF NOT EXISTS support_ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'assigned', 'status_changed', 'comment_added', 'resolved', 'reopened', 'priority_changed', 'sla_updated')),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_events_ticket
  ON support_ticket_events (ticket_id, created_at DESC);

CREATE TABLE IF NOT EXISTS support_ticket_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'skipped')) DEFAULT 'queued',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_notifications_ticket
  ON support_ticket_notifications (ticket_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_ticket_updated_at ON support_tickets;
CREATE TRIGGER trg_support_ticket_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_tickets_select_own"
  ON support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "support_tickets_insert_own"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "support_ticket_comments_select_own"
  ON support_ticket_comments FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "support_ticket_comments_insert_own"
  ON support_ticket_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "support_ticket_events_select_own"
  ON support_ticket_events FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "support_ticket_events_insert_own"
  ON support_ticket_events FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "support_ticket_notifications_select_own"
  ON support_ticket_notifications FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
  );

GRANT SELECT, INSERT ON support_tickets TO authenticated;
GRANT SELECT, INSERT ON support_ticket_comments TO authenticated;
GRANT SELECT, INSERT ON support_ticket_events TO authenticated;
GRANT SELECT ON support_ticket_notifications TO authenticated;
