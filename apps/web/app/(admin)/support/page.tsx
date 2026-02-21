'use client'

import { useEffect, useMemo, useState } from 'react'

type Ticket = {
  id: string
  user_id: string
  subject: string
  description: string
  category: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'triaged' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  assigned_agent_id: string | null
  sla_due_at: string
  sla_minutes: number
  first_response_at: string | null
  last_response_at: string | null
  resolution_summary: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

type Comment = {
  id: string
  ticket_id: string
  author_id: string
  body: string
  is_internal: boolean
  created_at: string
}

type Event = {
  id: string
  ticket_id: string
  actor_id: string | null
  event_type: string
  old_value: string | null
  new_value: string | null
  created_at: string
}

const priorities: Ticket['priority'][] = ['low', 'medium', 'high', 'urgent']
const statuses: Ticket['status'][] = ['open', 'triaged', 'assigned', 'in_progress', 'resolved', 'closed']

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [queueLoading, setQueueLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Ticket['priority']>('medium')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [assignedAgentId, setAssignedAgentId] = useState('')
  const [status, setStatus] = useState<Ticket['status']>('open')
  const [resolutionSummary, setResolutionSummary] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [commentInternal, setCommentInternal] = useState(false)
  const [updating, setUpdating] = useState(false)

  const selectedTicketLabel = useMemo(() => {
    if (!selectedTicket) return 'Select a ticket'
    return `${selectedTicket.subject} · ${selectedTicket.id}`
  }, [selectedTicket])

  const loadQueue = async () => {
    setQueueLoading(true)
    setFormError(null)
    try {
      const response = await fetch('/api/support/tickets?scope=queue')
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Failed to load ticket queue')
      }
      setTickets(payload.data.tickets || [])
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to load tickets')
    } finally {
      setQueueLoading(false)
    }
  }

  const loadTicket = async (ticketId: string) => {
    setDetailLoading(true)
    setDetailError(null)
    try {
      const response = await fetch(`/api/support/tickets?ticketId=${ticketId}&include=comments,history`)
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Failed to load ticket detail')
      }
      setSelectedTicket(payload.data.ticket)
      setComments(payload.data.comments || [])
      setEvents(payload.data.events || [])
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Failed to load ticket detail')
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    loadQueue()
  }, [])

  useEffect(() => {
    if (selectedTicketId) {
      loadTicket(selectedTicketId)
    } else {
      setSelectedTicket(null)
      setComments([])
      setEvents([])
    }
  }, [selectedTicketId])

  useEffect(() => {
    if (!selectedTicket) return
    setAssignedAgentId(selectedTicket.assigned_agent_id ?? '')
    setStatus(selectedTicket.status)
    setResolutionSummary(selectedTicket.resolution_summary ?? '')
  }, [selectedTicket])

  const handleCreateTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreating(true)
    setFormError(null)
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          description,
          category: category || null,
          priority,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Failed to create ticket')
      }
      setSubject('')
      setCategory('')
      setPriority('medium')
      setDescription('')
      await loadQueue()
      setSelectedTicketId(payload.data.id)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateTicket = async (payload: Record<string, unknown>) => {
    if (!selectedTicketId) return
    setUpdating(true)
    setDetailError(null)
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicketId,
          ...payload,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.error?.message || 'Failed to update ticket')
      }
      await loadQueue()
      await loadTicket(selectedTicketId)
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Failed to update ticket')
    } finally {
      setUpdating(false)
    }
  }

  const handleAssign = async () => {
    await handleUpdateTicket({
      assignedAgentId: assignedAgentId.trim() || null,
    })
  }

  const handleStatusChange = async () => {
    await handleUpdateTicket({
      status,
      resolutionSummary: status === 'resolved' ? resolutionSummary || null : undefined,
    })
  }

  const handlePriorityChange = async (nextPriority: Ticket['priority']) => {
    setPriority(nextPriority)
    await handleUpdateTicket({ priority: nextPriority })
  }

  const handleAddComment = async () => {
    if (!commentBody.trim()) return
    await handleUpdateTicket({
      comment: commentBody.trim(),
      isInternal: commentInternal,
    })
    setCommentBody('')
    setCommentInternal(false)
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
  }

  const formatSla = (slaDueAt?: string | null) => {
    if (!slaDueAt) return 'No SLA'
    const due = new Date(slaDueAt).getTime()
    const diffMs = due - Date.now()
    const hours = Math.ceil(Math.abs(diffMs) / 3600000)
    if (diffMs <= 0) {
      return `Overdue by ${hours}h`
    }
    return `${hours}h remaining`
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">Manage user support and ticket operations.</p>
        </div>
        <button
          type="button"
          onClick={loadQueue}
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={queueLoading}
        >
          {queueLoading ? 'Refreshing…' : 'Refresh Queue'}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Submit Ticket</h2>
          <p className="mt-1 text-sm text-gray-500">Capture a new issue from a user or admin.</p>
          <form className="mt-6 space-y-4" onSubmit={handleCreateTicket}>
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                placeholder="Short summary"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                placeholder="Payments, listings, account"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as Ticket['priority'])}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
              >
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-1 min-h-[120px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                placeholder="Describe the issue in detail"
                required
                minLength={10}
              />
            </div>
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            <button
              type="submit"
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={creating}
            >
              {creating ? 'Submitting…' : 'Create Ticket'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Support Queue</h2>
              <span className="text-sm text-gray-500">{tickets.length} tickets</span>
            </div>
            <div className="mt-4 space-y-3">
              {tickets.length === 0 && !queueLoading ? (
                <p className="text-sm text-gray-500">No tickets in the queue.</p>
              ) : null}
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                    selectedTicketId === ticket.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{ticket.subject}</span>
                    <span className="text-xs uppercase text-gray-500">{ticket.status}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Priority: {ticket.priority}</span>
                    <span>Category: {ticket.category || 'General'}</span>
                    <span>SLA: {formatSla(ticket.sla_due_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Ticket Detail</h2>
              <span className="text-xs text-gray-500">{selectedTicketLabel}</span>
            </div>

            {detailError ? <p className="mt-3 text-sm text-red-600">{detailError}</p> : null}
            {detailLoading ? (
              <p className="mt-4 text-sm text-gray-500">Loading ticket details…</p>
            ) : null}

            {selectedTicket ? (
              <div className="mt-4 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                    <div className="text-xs text-gray-500">Requester</div>
                    <div className="font-medium text-gray-900">{selectedTicket.user_id}</div>
                    <div className="mt-2 text-xs text-gray-500">Assigned Agent</div>
                    <div className="font-medium text-gray-900">
                      {selectedTicket.assigned_agent_id || 'Unassigned'}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="font-medium text-gray-900">{formatDate(selectedTicket.created_at)}</div>
                    <div className="mt-2 text-xs text-gray-500">SLA Due</div>
                    <div className="font-medium text-gray-900">{formatDate(selectedTicket.sla_due_at)}</div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">Issue</h3>
                  <p className="mt-2 text-sm text-gray-700">{selectedTicket.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Status: {selectedTicket.status}</span>
                    <span>Priority: {selectedTicket.priority}</span>
                    <span>Category: {selectedTicket.category || 'General'}</span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">Assignment</h3>
                    <input
                      value={assignedAgentId}
                      onChange={(event) => setAssignedAgentId(event.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                      placeholder="Agent user ID"
                    />
                    <button
                      type="button"
                      onClick={handleAssign}
                      className="mt-3 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                      disabled={updating}
                    >
                      {updating ? 'Updating…' : 'Assign Agent'}
                    </button>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">Status</h3>
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value as Ticket['status'])}
                      className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    >
                      {statuses.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {status === 'resolved' ? (
                      <textarea
                        value={resolutionSummary}
                        onChange={(event) => setResolutionSummary(event.target.value)}
                        className="mt-2 min-h-[80px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                        placeholder="Resolution summary"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={handleStatusChange}
                      className="mt-3 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                      disabled={updating}
                    >
                      {updating ? 'Updating…' : 'Update Status'}
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">Priority</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {priorities.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handlePriorityChange(item)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          selectedTicket.priority === item
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                        disabled={updating}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">Add Response</h3>
                  <textarea
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    className="mt-2 min-h-[100px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    placeholder="Write a response to the user"
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={commentInternal}
                      onChange={(event) => setCommentInternal(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Internal note (not visible to requester)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="mt-3 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                    disabled={updating}
                  >
                    {updating ? 'Sending…' : 'Send Response'}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">Responses</h3>
                    <div className="mt-3 space-y-3 text-sm text-gray-700">
                      {comments.length === 0 ? (
                        <p className="text-sm text-gray-500">No responses yet.</p>
                      ) : null}
                      {comments.map((comment) => (
                        <div key={comment.id} className="rounded-md border border-gray-200 p-3">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{comment.is_internal ? 'Internal' : 'Public'} response</span>
                            <span>{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{comment.body}</p>
                          <p className="mt-2 text-xs text-gray-400">By {comment.author_id}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">History</h3>
                    <div className="mt-3 space-y-3 text-sm text-gray-700">
                      {events.length === 0 ? (
                        <p className="text-sm text-gray-500">No history yet.</p>
                      ) : null}
                      {events.map((event) => (
                        <div key={event.id} className="rounded-md border border-gray-200 p-3">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{event.event_type.replace(/_/g, ' ')}</span>
                            <span>{formatDate(event.created_at)}</span>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            Actor: {event.actor_id || 'System'}
                          </p>
                          {event.old_value || event.new_value ? (
                            <p className="mt-2 text-xs text-gray-500">
                              {event.old_value || '—'} → {event.new_value || '—'}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">Select a ticket to view details.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
