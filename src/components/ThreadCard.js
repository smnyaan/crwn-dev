import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { threadService } from '../services/threadService';

const BRAND = '#5D1F1F';
const HONEY = '#C9963A';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now     = new Date();
  const date    = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7)   return `${days} days ago`;
  return date.toLocaleDateString();
}

export default function ThreadCard({ thread, isUpvoted = false, onUpvoteToggle, onPress }) {
  const { user }       = useAuth();
  const [toggling, setToggling] = useState(false);

  const upvoteCount = Number(thread?.upvotes?.[0]?.count ?? 0);
  const replyCount  = Number(thread?.replies?.[0]?.count  ?? 0);
  const timeAgo     = formatTimeAgo(thread?.created_at);

  const handleUpvote = async () => {
    if (!user || toggling) return;
    setToggling(true);
    const wasUpvoted = isUpvoted;
    onUpvoteToggle?.(thread.id, !wasUpvoted);
    const { error } = wasUpvoted
      ? await threadService.removeThreadUpvote(user.id, thread.id)
      : await threadService.upvoteThread(user.id, thread.id);
    if (error) onUpvoteToggle?.(thread.id, wasUpvoted);
    setToggling(false);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {thread?.category ? (
        <View style={styles.tagBubble}>
          <Text style={styles.tagText}>{thread.category}</Text>
        </View>
      ) : null}

      <Text style={styles.title} numberOfLines={2}>{thread?.title}</Text>

      {thread?.body ? (
        <Text style={styles.preview} numberOfLines={2}>{thread.body}</Text>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={handleUpvote}
          disabled={toggling || !user}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={isUpvoted ? 'heart' : 'heart-outline'}
            size={14}
            color="#e05c5c"
          />
          <Text style={[styles.footerText, isUpvoted && styles.footerTextActive]}>
            {upvoteCount}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dot}>•</Text>

        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={13} color="#9ca3af" />
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
    backgroundColor: '#FCFCFC',
    marginHorizontal: 14,
    marginVertical: 8,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2DDD9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tagBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5ede3',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e8d5bf',
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
    color: '#9c6b3c',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Figtree_700Bold',
    color: '#1a1a1a',
    lineHeight: 21,
    marginBottom: 5,
  },
  preview: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 3,
  },
  footerTextActive: {
    color: '#e05c5c',
    fontFamily: 'Figtree_600SemiBold',
  },
  dot: {
    color: '#d1d5db',
    marginHorizontal: 7,
    fontSize: 12,
  },
});
