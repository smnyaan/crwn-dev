import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../config/supabase';

/**
 * Returns the count of unread notifications for the current user.
 * Updates in real-time when new notifications arrive.
 */
export function useUnreadNotifications() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const channelRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    const { count: unread, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    if (!error) setCount(unread ?? 0);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    refresh();

    // Re-count when a new notification is inserted for this user
    const channel = supabase
      .channel(`unread_notifs:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        refresh
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [user?.id, refresh]);

  return count;
}
