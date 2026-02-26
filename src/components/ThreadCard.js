import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { threadService } from '../services/threadService';

const BRAND = '#5D1F1F';
const HONEY = '#C9963A';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

/**
 * ThreadCard
 *
 * Props:
 *   thread           — Supabase thread row with joined profiles, upvotes count, replies count
 *   isUpvoted        — boolean driven by parent's upvotedIds Set
 *   onUpvoteToggle   — (threadId, isNowUpvoted) callback so parent updates its state
 *   onPress          — navigate to detail
 */
export default function ThreadCard({ thread, isUpvoted = false, onUpvoteToggle, onPress }) {
  const { user } = useAuth();
  const [toggling, setToggling] = useState(false);

  // Supabase returns count aggregates as [{ count: N }]
  const upvoteCount = Number(thread?.upvotes?.[0]?.count ?? 0);
  const replyCount  = Number(thread?.replies?.[0]?.count ?? 0);
  const timeAgo     = formatTimeAgo(thread?.created_at);
  const preview     = thread?.body || '';

  const handleUpvote = async () => {
    if (!user || toggling) return;
    setToggling(true);

    const wasUpvoted = isUpvoted;
    // Optimistic update via parent callback
    onUpvoteToggle?.(thread.id, !wasUpvoted);

    const { error } = wasUpvoted
      ? await threadService.removeThreadUpvote(user.id, thread.id)
      : await threadService.upvoteThread(user.id, thread.id);

    if (error) {
      // Revert on failure
      onUpvoteToggle?.(thread.id, wasUpvoted);
      console.error('Thread upvote error:', error);
    }

    setToggling(false);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {thread?.category ? (
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{thread.category}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>{thread?.title}</Text>

      {preview ? (
        <Text style={styles.preview} numberOfLines={2}>{preview}</Text>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={handleUpvote}
          disabled={toggling || !user}
        >
          <Ionicons
            name={isUpvoted ? 'trophy' : 'trophy-outline'}
            size={15}
            color={isUpvoted ? BRAND : HONEY}
          />
          <Text style={[styles.footerText, isUpvoted && styles.footerTextActive]}>
            {upvoteCount}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dot}>•</Text>

        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={14} color="#9ca3af" />
          <Text style={styles.footerText}>{replyCount}</Text>
        </View>

        <Text style={styles.dot}>•</Text>

        <Text style={styles.footerText}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f0ee',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  tag: {
    fontSize: 12,
    color: BRAND,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 6,
  },
  preview: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 4,
  },
  footerTextActive: {
    color: BRAND,
    fontWeight: '600',
  },
  dot: {
    color: '#d1d5db',
    marginHorizontal: 8,
    fontSize: 12,
  },
});