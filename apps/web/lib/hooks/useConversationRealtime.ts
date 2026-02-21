'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  SupabaseClient,
} from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase/client'
import type { ConversationMessageRow } from '@/lib/types/database'

const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_MS = 1_500

type ConnectionState =
  | 'SUBSCRIBED'
  | 'TIMED_OUT'
  | 'CLOSED'
  | 'CHANNEL_ERROR'
  | 'CONNECTING'

interface UseConversationRealtimeOptions {
  conversationId: string
  onMessageInserted?: (message: ConversationMessageRow) => void
  onRefreshRequested?: () => void
  onConnectionStateChange?: (status: ConnectionState) => void
  onConnectionError?: (errorMessage: string) => void
  enableTypingIndicator?: boolean
  userId?: string
  onRemoteTypingChange?: (isTyping: boolean) => void
}

interface TypingBroadcastPayload {
  userId: string
  conversationId: string
  isTyping: boolean
}

function createRealtimeClientSafely(): SupabaseClient {
  try {
    return createBrowserClient()
  } catch {
    return createClient('https://placeholder.supabase.co', 'placeholder')
  }
}

function toConnectionState(status: string): ConnectionState {
  if (status === 'SUBSCRIBED') return 'SUBSCRIBED'
  if (status === 'TIMED_OUT') return 'TIMED_OUT'
  if (status === 'CLOSED') return 'CLOSED'
  if (status === 'CHANNEL_ERROR') return 'CHANNEL_ERROR'
  return 'CONNECTING'
}

export function useConversationRealtime({
  conversationId,
  onMessageInserted,
  onRefreshRequested,
  onConnectionStateChange,
  onConnectionError,
  enableTypingIndicator = false,
  userId,
  onRemoteTypingChange,
}: UseConversationRealtimeOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('CLOSED')
  const [remoteTyping, setRemoteTyping] = useState(false)

  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const supabase = useMemo(() => createRealtimeClientSafely(), [])

  const updateConnectionState = useCallback(
    (status: ConnectionState) => {
      setConnectionState(status)
      onConnectionStateChange?.(status)
    },
    [onConnectionStateChange]
  )

  const cleanupChannel = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (channelRef.current) {
      await channelRef.current.unsubscribe()
      await supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [supabase])

  useEffect(() => {
    if (!conversationId) return

    let active = true

    const connect = async () => {
      if (!active) return

      await cleanupChannel()
      const channel = supabase.channel(`conversation:${conversationId}`)

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresInsertPayload<ConversationMessageRow>) => {
          onMessageInserted?.(payload.new)
          onRefreshRequested?.()
        }
      )

      if (enableTypingIndicator) {
        channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
          const typingPayload = payload as TypingBroadcastPayload
          if (
            typingPayload.conversationId === conversationId &&
            typingPayload.userId !== userId
          ) {
            setRemoteTyping(typingPayload.isTyping)
            onRemoteTypingChange?.(typingPayload.isTyping)
          }
        })
      }

      channel.subscribe((status, error) => {
        const connectionStatus = toConnectionState(status)
        updateConnectionState(connectionStatus)

        if (status === 'SUBSCRIBED') {
          reconnectAttemptsRef.current = 0
          return
        }

        if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            const message =
              error?.message ??
              `Realtime channel disconnected after ${MAX_RECONNECT_ATTEMPTS} retry attempts.`
            onConnectionError?.(message)
            return
          }

          reconnectAttemptsRef.current += 1
          reconnectTimeoutRef.current = setTimeout(() => {
            void connect()
          }, RECONNECT_DELAY_MS)
        }
      })

      channelRef.current = channel
    }

    void connect()

    return () => {
      active = false
      void cleanupChannel()
    }
  }, [
    cleanupChannel,
    conversationId,
    enableTypingIndicator,
    onConnectionError,
    onMessageInserted,
    onRefreshRequested,
    onRemoteTypingChange,
    supabase,
    updateConnectionState,
    userId,
  ])

  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      if (!enableTypingIndicator || !channelRef.current || !userId) return

      await channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId,
          conversationId,
          isTyping,
        } satisfies TypingBroadcastPayload,
      })
    },
    [conversationId, enableTypingIndicator, userId]
  )

  return {
    connectionState,
    remoteTyping,
    sendTypingIndicator,
    getChannelStates: () => supabase.getChannels().map((channel) => channel.state),
  }
}
