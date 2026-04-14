import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { messagingService } from '../services/messagingService';

/**
 * Returns the count of conversations with unread messages for the current user.
 * Updates in real-time when new messages arrive.
 */
export function useUnreadMessages() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const channelRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    const c = await messagingService.getUnreadCount(user.id);
    setCount(c);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    refresh();

    // Re-check whenever any conversation belonging to this user updates
    const channel = messagingService.subscribeToConversations(user.id, refresh);
    channelRef.current = channel;

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [user?.id, refresh]);

  return count;
}
