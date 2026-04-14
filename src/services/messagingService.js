import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

/**
 * Messaging service — requires these tables in Supabase:
 *
 * Run in Supabase SQL Editor:
 * ─────────────────────────────────────────────────────────────────
 * create table if not exists conversations (
 *   id uuid default gen_random_uuid() primary key,
 *   participant1_id uuid not null references profiles(id) on delete cascade,
 *   participant2_id uuid not null references profiles(id) on delete cascade,
 *   last_message text,
 *   last_message_at timestamptz default now(),
 *   created_at timestamptz default now()
 * );
 *
 * create table if not exists messages (
 *   id uuid default gen_random_uuid() primary key,
 *   conversation_id uuid not null references conversations(id) on delete cascade,
 *   sender_id uuid not null references profiles(id) on delete cascade,
 *   content text not null,
 *   created_at timestamptz default now()
 * );
 *
 * alter table conversations enable row level security;
 * alter table messages enable row level security;
 *
 * create policy "view own conversations" on conversations for select
 *   using (auth.uid() = participant1_id or auth.uid() = participant2_id);
 * create policy "create conversation" on conversations for insert
 *   with check (auth.uid() = participant1_id or auth.uid() = participant2_id);
 * create policy "update own conversation" on conversations for update
 *   using (auth.uid() = participant1_id or auth.uid() = participant2_id);
 *
 * create policy "view messages in own convos" on messages for select
 *   using (exists (
 *     select 1 from conversations
 *     where id = messages.conversation_id
 *       and (participant1_id = auth.uid() or participant2_id = auth.uid())
 *   ));
 * create policy "send messages" on messages for insert
 *   with check (
 *     auth.uid() = sender_id
 *     and exists (
 *       select 1 from conversations
 *       where id = conversation_id
 *         and (participant1_id = auth.uid() or participant2_id = auth.uid())
 *     )
 *   );
 *
 * alter publication supabase_realtime add table messages;
 * alter publication supabase_realtime add table conversations;
 *
 * -- Also add last_sender_id for unread tracking:
 * ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_sender_id uuid;
 * ─────────────────────────────────────────────────────────────────
 */

export const messagingService = {

  // ── Conversations ──────────────────────────────────────────────────────────

  async getConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:participant1_id (id, username, full_name, avatar_url),
        participant2:participant2_id (id, username, full_name, avatar_url)
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    return { data, error };
  },

  async getOrCreateConversation(userId, otherUserId) {
    // Look for an existing conversation in either direction
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant1_id.eq.${userId},participant2_id.eq.${otherUserId}),` +
        `and(participant1_id.eq.${otherUserId},participant2_id.eq.${userId})`
      )
      .maybeSingle();

    if (existing) return { data: existing, error: null };

    const { data, error } = await supabase
      .from('conversations')
      .insert({ participant1_id: userId, participant2_id: otherUserId })
      .select()
      .single();

    return { data, error };
  },

  // ── Messages ───────────────────────────────────────────────────────────────

  async getMessages(conversationId, limit = 60) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    return { data, error };
  },

  async sendMessage(conversationId, senderId, content) {
    const trimmed = content.trim();

    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, content: trimmed })
      .select()
      .single();

    if (!error) {
      await supabase
        .from('conversations')
        .update({
          last_message: trimmed,
          last_message_at: new Date().toISOString(),
          last_sender_id: senderId,
        })
        .eq('id', conversationId);
    }

    return { data, error };
  },

  // Mark a conversation as read by storing the timestamp client-side
  async markConversationRead(conversationId) {
    await AsyncStorage.setItem(
      `@msg_read_${conversationId}`,
      new Date().toISOString()
    );
  },

  // Count conversations where someone else sent the last message after the user last read it
  async getUnreadCount(userId) {
    const { data: convos } = await supabase
      .from('conversations')
      .select('id, last_sender_id, last_message_at')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    if (!convos?.length) return 0;

    let count = 0;
    await Promise.all(
      convos.map(async (c) => {
        if (!c.last_sender_id || c.last_sender_id === userId) return;
        const readAt = await AsyncStorage.getItem(`@msg_read_${c.id}`);
        if (!readAt || new Date(c.last_message_at) > new Date(readAt)) {
          count++;
        }
      })
    );
    return count;
  },

  // ── Realtime ───────────────────────────────────────────────────────────────

  subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, callback)
      .subscribe();
  },

  subscribeToConversations(userId, callback) {
    return supabase
      .channel(`convos:${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'conversations',
        filter: `participant1_id=eq.${userId}`,
      }, callback)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'conversations',
        filter: `participant2_id=eq.${userId}`,
      }, callback)
      .subscribe();
  },

  // ── User search (for "New Message") ───────────────────────────────────────

  async searchUsers(query, currentUserId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .neq('id', currentUserId)
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(12);

    return { data, error };
  },
};
