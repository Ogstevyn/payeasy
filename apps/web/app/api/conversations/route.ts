import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { successResponse, errorResponse, getUserId } from "@/lib/api-utils";
import type { ConversationPreview } from "@/lib/types/messages";

/**
 * GET /api/conversations
 *
 * List all conversations for the authenticated user, ordered by most
 * recent activity (updated_at DESC). Each entry includes the last
 * message preview and participant list.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParams = searchParams.get("limit");
    const limit = limitParams ? parseInt(limitParams, 10) : 50;
    // 1. Authenticate
    const userId = getUserId(request);
    if (!userId) {
      return errorResponse("Authentication required.", 401, "UNAUTHORIZED");
    }

    // 2. Get conversation IDs the user participates in
    const { data: participations, error: partError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (partError) {
      console.error("Failed to fetch participations:", partError);
      return errorResponse("Failed to load conversations.", 500, "INTERNAL_ERROR");
    }

    if (!participations || participations.length === 0) {
      return successResponse<ConversationPreview[]>([]);
    }

    const conversationIds = participations.map((p) => p.conversation_id);

    // 3. Fetch conversations with metadata
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("id, created_at, updated_at")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (convError) {
      console.error("Failed to fetch conversations:", convError);
      return errorResponse("Failed to load conversations.", 500, "INTERNAL_ERROR");
    }

    // 4. Enrich each conversation with last message + participants
    const previews: ConversationPreview[] = await Promise.all(
      (conversations ?? []).map(async (conv) => {
        // Last message (non-deleted)
        const { data: lastMessages } = await supabase
          .from("messages")
          .select("content, sender_id, created_at")
          .eq("conversation_id", conv.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1);

        // Unread count
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("read_at", null) // Assuming unread meant read_at is null but in prompt: read = false, wait, the schema says read_at is TIMESTAMPTZ, so read_at is null
          .neq("sender_id", userId);

        // All participants with profiles
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select(`
            id,
            user_id,
            users:user_id (username, avatar_url)
          `)
          .eq("conversation_id", conv.id);

        const formattedParticipants = (participants ?? []).map((p: any) => ({
          id: p.id,
          user_id: p.user_id,
          username: p.users?.username,
          avatar_url: p.users?.avatar_url,
        }));

        const otherParticipant = formattedParticipants.find(p => p.user_id !== userId);

        return {
          id: conv.id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          last_message: lastMessages?.[0] ?? null,
          participants: formattedParticipants,
          unread_count: unreadCount ?? 0,
          other_user: otherParticipant ? {
            username: otherParticipant.username || 'Unknown User',
            avatar_url: otherParticipant.avatar_url || '',
          } : undefined,
        };
      })
    );

    return successResponse(previews);
  } catch (err) {
    console.error("GET /api/conversations error:", err);
    return errorResponse("Internal server error.", 500, "INTERNAL_ERROR");
  }
}
