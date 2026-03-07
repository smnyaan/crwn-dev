import { useState, useEffect, useCallback } from 'react';
import { threadService } from '../services/threadService';
import { useAuth } from './useAuth';

/**
 * useThreads
 *
 * Fetches all threads from Supabase and, if a user is logged in,
 * also fetches the set of thread IDs they have already upvoted.
 * Client-side filtering (category, search) is done in ThreadList
 * to avoid re-fetching on every keystroke or tab switch.
 */
export const useThreads = () => {
  const { user } = useAuth();

  const [threads, setThreads] = useState([]);
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Run both fetches in parallel
    const [threadsResult, upvotesResult] = await Promise.all([
      threadService.getThreads(),
      user ? threadService.getUpvotedThreadIds(user.id) : Promise.resolve({ ids: [] }),
    ]);

    if (threadsResult.error) {
      setError(threadsResult.error);
      console.error('Error fetching threads:', threadsResult.error);
    } else {
      setThreads(threadsResult.data || []);
    }

    setUpvotedIds(new Set(upvotesResult.ids || []));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  /**
   * Optimistically update a thread's upvote count and the upvotedIds set.
   * Called from ThreadCard after a successful (or optimistic) toggle.
   */
  const toggleUpvoteLocally = useCallback((threadId, isNowUpvoted) => {
    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (isNowUpvoted) next.add(threadId);
      else next.delete(threadId);
      return next;
    });
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const currentCount = Number(t.upvotes?.[0]?.count ?? 0);
        return {
          ...t,
          upvotes: [{ count: isNowUpvoted ? currentCount + 1 : currentCount - 1 }],
        };
      })
    );
  }, []);

  /**
   * Prepend a freshly created thread to the list without refetching.
   */
  const prependThread = useCallback((thread) => {
    setThreads((prev) => [thread, ...prev]);
  }, []);

  /**
   * Remove a thread from the list after it has been deleted.
   */
  const removeThread = useCallback((threadId) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  }, []);

  return {
    threads,
    upvotedIds,
    loading,
    error,
    refresh: fetchThreads,
    toggleUpvoteLocally,
    prependThread,
    removeThread,
  };
};