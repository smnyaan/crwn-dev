import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { messagingService } from '../services/messagingService';

const UnreadCountContext = createContext({
  notifCount: 0,
  msgCount: 0,
  decrementNotif: () => {},
  clearNotifs: () => {},
  refreshMessages: () => {},
});

export function UnreadCountProvider({ children }) {
  const { user } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const notifChannelRef = useRef(null);
  const convoChannelRef = useRef(null);

  // ── Notifications ────────────────────────────────────────────────────────────

  const refreshNotifs = useCallback(async () => {
    if (!user?.id) return;
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    if (!error) setNotifCount(count ?? 0);
  }, [user?.id]);

  // Immediately decrement by 1 (optimistic) — avoids waiting for DB realtime UPDATE
  const decrementNotif = useCallback(() => {
    setNotifCount(prev => Math.max(0, prev - 1));
  }, []);

  // Zero out (mark all read)
  const clearNotifs = useCallback(() => {
    setNotifCount(0);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    refreshNotifs();

    // Listen for INSERT (new notification) — UPDATE events require REPLICA IDENTITY FULL
    // so we handle read-decrement optimistically via decrementNotif()
    const channel = supabase
      .channel(`unread_notifs_ctx:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => setNotifCount(prev => prev + 1)
      )
      // Also handle UPDATE in case REPLICA IDENTITY FULL is configured
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        refreshNotifs
      )
      .subscribe();

    notifChannelRef.current = channel;
    return () => {
      notifChannelRef.current?.unsubscribe();
      notifChannelRef.current = null;
    };
  }, [user?.id, refreshNotifs]);

  // ── Messages ─────────────────────────────────────────────────────────────────

  const refreshMessages = useCallback(async () => {
    if (!user?.id) return;
    const c = await messagingService.getUnreadCount(user.id);
    setMsgCount(c);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    refreshMessages();

    const channel = messagingService.subscribeToConversations(user.id, refreshMessages);
    convoChannelRef.current = channel;

    return () => {
      convoChannelRef.current?.unsubscribe();
      convoChannelRef.current = null;
    };
  }, [user?.id, refreshMessages]);

  return (
    <UnreadCountContext.Provider
      value={{ notifCount, msgCount, decrementNotif, clearNotifs, refreshMessages }}
    >
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  return useContext(UnreadCountContext);
}
