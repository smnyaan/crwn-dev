import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { threadService } from '../services/threadService';
import { useTheme } from '../context/ThemeContext';

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

// ─── ReplyCard ───────────────────────────────────────────────────────────────

function ReplyCard({ reply, isUpvoted, onUpvoteToggle, currentUserId, onDelete }) {
  const [toggling, setToggling] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const upvoteCount = Number(reply?.upvotes?.[0]?.count ?? 0);
  const author      = reply?.profiles?.username || 'Anonymous';
  const isOwner     = reply?.user_id === currentUserId;

  const handleUpvote = async () => {
    if (!currentUserId || toggling) return;
    setToggling(true);
    const wasUpvoted = isUpvoted;
    onUpvoteToggle(reply.id, !wasUpvoted);

    const { error } = wasUpvoted
      ? await threadService.removeReplyUpvote(currentUserId, reply.id)
      : await threadService.upvoteReply(currentUserId, reply.id);

    if (error) {
      onUpvoteToggle(reply.id, wasUpvoted);
      console.error('Reply upvote error:', error);
    }
    setToggling(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete reply', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(reply.id),
      },
    ]);
  };

  return (
    <View style={styles.replyCard}>
      <View style={styles.replyHeader}>
        <Text style={styles.replyAuthor}>@{author}</Text>
        <View style={styles.replyHeaderRight}>
          <Text style={styles.replyTime}>{formatTimeAgo(reply?.created_at)}</Text>
          {isOwner && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.replyBody}>{reply?.body}</Text>
      <TouchableOpacity
        style={styles.replyUpvote}
        onPress={handleUpvote}
        disabled={toggling || !currentUserId}
      >
        <Ionicons
          name={isUpvoted ? 'heart' : 'heart-outline'}
          size={14}
          color={HONEY}
        />
        <Text style={[styles.replyUpvoteText, isUpvoted && styles.replyUpvoteActive]}>
          {upvoteCount}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ThreadDetailScreen ──────────────────────────────────────────────────────

/**
 * Props:
 *   thread          — thread row (passed from CommunityScreen, may have stale counts)
 *   isThreadUpvoted — boolean from parent's upvotedIds
 *   onThreadUpvoteToggle(threadId, isNowUpvoted)
 *   onBack()
 */
export default function ThreadDetailScreen({
  thread,
  isThreadUpvoted = false,
  onThreadUpvoteToggle,
  onBack,
  onThreadDeleted,
}) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [replies, setReplies]           = useState([]);
  const [upvotedReplyIds, setUpvotedReplyIds] = useState(new Set());
  const [loadingReplies, setLoadingReplies]   = useState(true);
  const [replyText, setReplyText]       = useState('');
  const [posting, setPosting]           = useState(false);
  const [toggling, setToggling]         = useState(false);

  // ── Fetch replies + user's reply upvotes on mount ────────────────────────

  const fetchReplies = useCallback(async () => {
    if (!thread?.id) return;
    setLoadingReplies(true);

    const [repliesResult, upvotesResult] = await Promise.all([
      threadService.getReplies(thread.id),
      user
        ? threadService.getUpvotedReplyIds(user.id, thread.id)
        : Promise.resolve({ ids: [] }),
    ]);

    if (!repliesResult.error) {
      setReplies(repliesResult.data || []);
    }
    setUpvotedReplyIds(new Set(upvotesResult.ids || []));
    setLoadingReplies(false);
  }, [thread?.id, user]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  // ── Thread upvote (delegates to parent so list stays in sync) ────────────

  const handleThreadUpvote = async () => {
    if (!user || toggling) return;
    setToggling(true);
    const wasUpvoted = isThreadUpvoted;
    onThreadUpvoteToggle?.(thread.id, !wasUpvoted);

    const { error } = wasUpvoted
      ? await threadService.removeThreadUpvote(user.id, thread.id)
      : await threadService.upvoteThread(user.id, thread.id);

    if (error) {
      onThreadUpvoteToggle?.(thread.id, wasUpvoted);
      console.error('Thread upvote error:', error);
    }
    setToggling(false);
  };

  // ── Reply upvote (local state only — replies aren't in the parent list) ──

  const handleReplyUpvoteToggle = (replyId, isNowUpvoted) => {
    setUpvotedReplyIds((prev) => {
      const next = new Set(prev);
      if (isNowUpvoted) next.add(replyId);
      else next.delete(replyId);
      return next;
    });
    setReplies((prev) =>
      prev.map((r) => {
        if (r.id !== replyId) return r;
        const current = Number(r.upvotes?.[0]?.count ?? 0);
        return { ...r, upvotes: [{ count: isNowUpvoted ? current + 1 : current - 1 }] };
      })
    );
  };

  // ── Post a reply ──────────────────────────────────────────────────────────

  const handlePostReply = async () => {
    if (!replyText.trim() || !user || posting) return;
    setPosting(true);

    const { data, error } = await threadService.createReply(
      user.id,
      thread.id,
      replyText.trim()
    );

    if (error) {
      Alert.alert('Error', 'Could not post your reply. Please try again.');
      console.error('Create reply error:', error);
    } else if (data) {
      setReplies((prev) => [...prev, data]);
      setReplyText('');
    }
    setPosting(false);
  };

  // ── Delete a reply ────────────────────────────────────────────────────────

  const handleDeleteReply = async (replyId) => {
    if (!user) return;
    const { error } = await threadService.deleteReply(replyId, user.id);
    if (!error) {
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
    }
  };

  // ── Delete the thread ─────────────────────────────────────────────────────

  const handleDeleteThread = () => {
    Alert.alert('Delete discussion', 'This will permanently delete your post and all replies.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await threadService.deleteThread(thread.id, user.id);
          if (error) {
            Alert.alert('Error', 'Could not delete the discussion. Please try again.');
          } else {
            onThreadDeleted?.(thread.id);
          }
        },
      },
    ]);
  };

  // ── Derived display values ────────────────────────────────────────────────

  const upvoteCount = Number(thread?.upvotes?.[0]?.count ?? 0);
  const author      = thread?.profiles?.username || 'Anonymous';

  if (!thread) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        {thread.user_id === user?.id && (
          <TouchableOpacity onPress={handleDeleteThread} style={styles.backBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Thread post ── */}
        <View style={styles.post}>
          <View style={styles.postMeta}>
            <Text style={styles.postAuthor}>@{author}</Text>
            {thread.category ? (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{thread.category}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.postTitle}>{thread.title}</Text>
          <Text style={styles.postBody}>{thread.body}</Text>

          <View style={styles.postFooter}>
            <TouchableOpacity
              style={styles.footerItem}
              onPress={handleThreadUpvote}
              disabled={toggling || !user}
            >
              <Ionicons
                name={isThreadUpvoted ? 'heart' : 'heart-outline'}
                size={15}
                color={HONEY}
              />
              <Text style={[styles.footerText, isThreadUpvoted && styles.footerTextActive]}>
                {upvoteCount}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.footerText}>{formatTimeAgo(thread.created_at)}</Text>
          </View>
        </View>

        {/* ── Replies ── */}
        <View style={styles.divider} />
        <View style={styles.repliesSection}>
          <Text style={styles.repliesHeading}>
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </Text>

          {loadingReplies ? (
            <ActivityIndicator color={BRAND} style={{ marginTop: 24 }} />
          ) : replies.length === 0 ? (
            <Text style={styles.noReplies}>Be the first to reply!</Text>
          ) : (
            replies.map((r) => (
              <ReplyCard
                key={r.id}
                reply={r}
                isUpvoted={upvotedReplyIds.has(r.id)}
                onUpvoteToggle={handleReplyUpvoteToggle}
                currentUserId={user?.id}
                onDelete={handleDeleteReply}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Reply input bar ── */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={user ? 'Add your reply...' : 'Sign in to reply'}
          placeholderTextColor={colors.placeholder}
          value={replyText}
          onChangeText={setReplyText}
          multiline
          editable={!!user}
        />
        <TouchableOpacity
          style={[
            styles.postBtn,
            (!replyText.trim() || !user || posting) && styles.postBtnDisabled,
          ]}
          onPress={handlePostReply}
          disabled={!replyText.trim() || !user || posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (c) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: c.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece8',
    backgroundColor: c.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: 20,
  },

  // ── Original post ──
  post: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece8',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  postAuthor: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: HONEY,
  },
  categoryTag: {
    backgroundColor: '#f5f0eb',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryTagText: {
    fontSize: 11,
    color: '#9c6b3c',
    fontFamily: 'Figtree_500Medium',
  },
  postTitle: {
    fontSize: 19,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
    lineHeight: 26,
    marginBottom: 10,
  },
  postBody: {
    fontSize: 14,
    color: c.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  postFooter: {
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
    color: c.textMuted,
    marginLeft: 3,
  },
  footerTextActive: {
    color: HONEY,
    fontFamily: 'Figtree_600SemiBold',
  },
  dot: {
    color: c.border,
    marginHorizontal: 8,
    fontSize: 12,
  },

  // ── Replies section ──
  repliesSection: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  repliesHeading: {
    fontSize: 15,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
    marginBottom: 4,
  },
  noReplies: {
    color: c.textMuted,
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },

  // ── Reply card ──
  replyCard: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: c.borderLight,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyAuthor: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: HONEY,
  },
  replyTime: {
    fontSize: 11,
    color: c.textMuted,
  },
  deleteBtn: {
    padding: 2,
  },
  replyBody: {
    fontSize: 14,
    color: c.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  replyUpvote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyUpvoteText: {
    fontSize: 13,
    color: c.textMuted,
    marginLeft: 3,
  },
  replyUpvoteActive: {
    color: HONEY,
    fontFamily: 'Figtree_600SemiBold',
  },

  // ── Input bar ──
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0ece8',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f0eb',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: c.text,
    maxHeight: 100,
  },
  postBtn: {
    backgroundColor: BRAND,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 56,
    alignItems: 'center',
  },
  postBtnDisabled: {
    backgroundColor: '#ccc',
  },
  postBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
  },
});
