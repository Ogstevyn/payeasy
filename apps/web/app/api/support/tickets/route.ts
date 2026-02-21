import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse } from "@/lib/api-utils";

const priorities = ["low", "medium", "high", "urgent"] as const;
const statuses = ["open", "triaged", "assigned", "in_progress", "resolved", "closed"] as const;

const createTicketSchema = z.object({
  subject: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  category: z.string().min(2).max(50).optional().nullable(),
  priority: z.enum(priorities).optional(),
});

const updateTicketSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(statuses).optional(),
  assignedAgentId: z.string().uuid().nullable().optional(),
  priority: z.enum(priorities).optional(),
  resolutionSummary: z.string().min(2).max(2000).optional().nullable(),
  comment: z.string().min(1).max(5000).optional(),
  isInternal: z.boolean().optional(),
});

type Priority = (typeof priorities)[number];

const slaMinutesByPriority: Record<Priority, number> = {
  low: 4320,
  medium: 2880,
  high: 1440,
  urgent: 480,
};

function buildSlaDueAt(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

async function getUserEmail(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await admin.from("users").select("email").eq("id", userId).single();
  return data?.email ?? null;
}

async function recordNotification(params: {
  admin: ReturnType<typeof createAdminClient>;
  ticketId: string;
  recipientEmail: string;
  template: string;
  subject: string;
  body: string;
}) {
  const { admin, ticketId, recipientEmail, template, subject, body } = params;
  const webhookUrl = process.env.SUPPORT_EMAIL_WEBHOOK_URL;
  const defaultStatus = webhookUrl ? "queued" : "sent";
  const defaultSentAt = webhookUrl ? null : new Date().toISOString();

  const { data: notification } = await admin
    .from("support_ticket_notifications")
    .insert({
      ticket_id: ticketId,
      recipient_email: recipientEmail,
      template,
      subject,
      body,
      status: defaultStatus,
      sent_at: defaultSentAt,
    })
    .select()
    .single();

  if (!webhookUrl || !notification) {
    return;
  }

  const webhookSecret = process.env.SUPPORT_EMAIL_WEBHOOK_SECRET;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
    },
    body: JSON.stringify({
      to: recipientEmail,
      subject,
      body,
      template,
      ticket_id: ticketId,
    }),
  });

  if (response.ok) {
    await admin
      .from("support_ticket_notifications")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", notification.id);
  } else {
    await admin
      .from("support_ticket_notifications")
      .update({ status: "failed", error: `Webhook status ${response.status}` })
      .eq("id", notification.id);
  }
}

async function addEvent(params: {
  admin: ReturnType<typeof createAdminClient>;
  ticketId: string;
  actorId: string | null;
  eventType: string;
  oldValue?: string | null;
  newValue?: string | null;
}) {
  const { admin, ticketId, actorId, eventType, oldValue, newValue } = params;
  await admin.from("support_ticket_events").insert({
    ticket_id: ticketId,
    actor_id: actorId,
    event_type: eventType,
    old_value: oldValue ?? null,
    new_value: newValue ?? null,
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ticketId = searchParams.get("ticketId");
    const scope = searchParams.get("scope");
    const include = new Set(
      (searchParams.get("include") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    );

    const isQueue = scope === "queue";
    const supabase = isQueue ? createAdminClient() : await createClient();

    if (ticketId) {
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (ticketError || !ticket) {
        return errorResponse("Ticket not found.", 404, "NOT_FOUND");
      }

      let comments: unknown[] | null = null;
      let events: unknown[] | null = null;

      if (include.has("comments")) {
        const { data } = await supabase
          .from("support_ticket_comments")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true });
        comments = data ?? [];
      }

      if (include.has("history")) {
        const { data } = await supabase
          .from("support_ticket_events")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: false });
        events = data ?? [];
      }

      return successResponse({ ticket, comments, events });
    }

    if (isQueue) {
      const { data: tickets, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return errorResponse("Failed to load ticket queue.", 500, "INTERNAL_ERROR");
      }

      return successResponse({ tickets: tickets ?? [] });
    }

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return errorResponse("Authentication required.", 401, "UNAUTHORIZED");
    }

    const { data: tickets, error } = await authClient
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse("Failed to load tickets.", 500, "INTERNAL_ERROR");
    }

    return successResponse({ tickets: tickets ?? [] });
  } catch (error) {
    return errorResponse("Internal server error.", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Authentication required.", 401, "UNAUTHORIZED");
    }

    const body = await request.json().catch(() => null);
    const validation = createTicketSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.message, 400, "VALIDATION_ERROR");
    }

    const priority = validation.data.priority ?? "medium";
    const slaMinutes = slaMinutesByPriority[priority];
    const slaDueAt = buildSlaDueAt(slaMinutes);

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject: validation.data.subject,
        description: validation.data.description,
        category: validation.data.category ?? null,
        priority,
        sla_minutes: slaMinutes,
        sla_due_at: slaDueAt,
      })
      .select()
      .single();

    if (error || !ticket) {
      return errorResponse("Failed to create ticket.", 500, "INTERNAL_ERROR");
    }

    const admin = createAdminClient();
    await addEvent({
      admin,
      ticketId: ticket.id,
      actorId: user.id,
      eventType: "created",
    });

    const requesterEmail = await getUserEmail(admin, user.id);
    if (requesterEmail) {
      await recordNotification({
        admin,
        ticketId: ticket.id,
        recipientEmail: requesterEmail,
        template: "ticket_created",
        subject: `Support ticket received: ${ticket.subject}`,
        body: `Your ticket ${ticket.id} has been created with priority ${ticket.priority}.`,
      });
    }

    const supportTeamEmail = process.env.SUPPORT_TEAM_EMAIL;
    if (supportTeamEmail) {
      await recordNotification({
        admin,
        ticketId: ticket.id,
        recipientEmail: supportTeamEmail,
        template: "ticket_created_team",
        subject: `New support ticket: ${ticket.subject}`,
        body: `New ticket ${ticket.id} created by ${user.id}.`,
      });
    }

    return successResponse(ticket, 201);
  } catch (error) {
    return errorResponse("Internal server error.", 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Authentication required.", 401, "UNAUTHORIZED");
    }

    const body = await request.json().catch(() => null);
    const validation = updateTicketSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.message, 400, "VALIDATION_ERROR");
    }

    const { ticketId, status, assignedAgentId, priority, resolutionSummary, comment, isInternal } =
      validation.data;

    if (!status && assignedAgentId === undefined && !priority && !resolutionSummary && !comment) {
      return errorResponse("No updates provided.", 400, "VALIDATION_ERROR");
    }

    const admin = createAdminClient();
    const { data: ticket, error: ticketError } = await admin
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      return errorResponse("Ticket not found.", 404, "NOT_FOUND");
    }

    const updates: Record<string, unknown> = {};

    if (priority && priority !== ticket.priority) {
      const slaMinutes = slaMinutesByPriority[priority];
      updates.priority = priority;
      updates.sla_minutes = slaMinutes;
      updates.sla_due_at = buildSlaDueAt(slaMinutes);
      await addEvent({
        admin,
        ticketId,
        actorId: user.id,
        eventType: "priority_changed",
        oldValue: ticket.priority,
        newValue: priority,
      });
      await addEvent({
        admin,
        ticketId,
        actorId: user.id,
        eventType: "sla_updated",
        oldValue: ticket.sla_due_at,
        newValue: updates.sla_due_at as string,
      });
    }

    if (assignedAgentId !== undefined && assignedAgentId !== ticket.assigned_agent_id) {
      updates.assigned_agent_id = assignedAgentId;
      if (!status && assignedAgentId) {
        updates.status = "assigned";
      }
      await addEvent({
        admin,
        ticketId,
        actorId: user.id,
        eventType: "assigned",
        oldValue: ticket.assigned_agent_id ?? null,
        newValue: assignedAgentId ?? null,
      });
    }

    if (status && status !== ticket.status) {
      updates.status = status;
      await addEvent({
        admin,
        ticketId,
        actorId: user.id,
        eventType: "status_changed",
        oldValue: ticket.status,
        newValue: status,
      });

      if (status === "resolved") {
        updates.resolved_at = new Date().toISOString();
        if (resolutionSummary) {
          updates.resolution_summary = resolutionSummary;
        }
        await addEvent({
          admin,
          ticketId,
          actorId: user.id,
          eventType: "resolved",
          oldValue: ticket.status,
          newValue: status,
        });
      }

      if (status !== "resolved" && ticket.resolved_at) {
        updates.resolved_at = null;
        updates.resolution_summary = null;
        await addEvent({
          admin,
          ticketId,
          actorId: user.id,
          eventType: "reopened",
          oldValue: ticket.status,
          newValue: status,
        });
      }
    } else if (resolutionSummary) {
      updates.resolution_summary = resolutionSummary;
    }

    if (comment) {
      await admin.from("support_ticket_comments").insert({
        ticket_id: ticketId,
        author_id: user.id,
        body: comment,
        is_internal: isInternal ?? false,
      });

      updates.last_response_at = new Date().toISOString();
      if (!ticket.first_response_at && user.id !== ticket.user_id) {
        updates.first_response_at = new Date().toISOString();
      }

      await addEvent({
        admin,
        ticketId,
        actorId: user.id,
        eventType: "comment_added",
      });
    }

    let updatedTicket = ticket;
    if (Object.keys(updates).length > 0) {
      const { data, error } = await admin
        .from("support_tickets")
        .update(updates)
        .eq("id", ticketId)
        .select()
        .single();

      if (error || !data) {
        return errorResponse("Failed to update ticket.", 500, "INTERNAL_ERROR");
      }
      updatedTicket = data;
    }

    const requesterEmail = await getUserEmail(admin, updatedTicket.user_id);
    if (requesterEmail) {
      await recordNotification({
        admin,
        ticketId,
        recipientEmail: requesterEmail,
        template: "ticket_updated",
        subject: `Ticket update: ${updatedTicket.subject}`,
        body: `Ticket ${updatedTicket.id} status is now ${updatedTicket.status}.`,
      });
    }

    if (assignedAgentId) {
      const assigneeEmail = await getUserEmail(admin, assignedAgentId);
      if (assigneeEmail) {
        await recordNotification({
          admin,
          ticketId,
          recipientEmail: assigneeEmail,
          template: "ticket_assigned",
          subject: `Ticket assigned: ${updatedTicket.subject}`,
          body: `You have been assigned ticket ${updatedTicket.id}.`,
        });
      }
    }

    return successResponse(updatedTicket);
  } catch (error) {
    return errorResponse("Internal server error.", 500, "INTERNAL_ERROR");
  }
}
