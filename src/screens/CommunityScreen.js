import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ThreadList from '../components/ThreadList';
import ThreadDetailScreen from './ThreadDetailScreen';
import CreateThreadScreen from './CreateThreadScreen';
import { useThreads } from '../hooks/useThreads';

// Three views the community tab can show
const VIEW = {
  LIST:   'list',
  DETAIL: 'detail',
  CREATE: 'create',
};

/**
 * CommunityScreen
 *
 * Owns the list ↔ detail ↔ create navigation state for the Community tab,
 * and owns the shared thread+upvote state so that upvotes made in the detail
 * view are immediately reflected when the user goes back to the list.
 */
export default function CommunityScreen() {
  const [view, setView]                   = useState(VIEW.LIST);
  const [selectedThread, setSelectedThread] = useState(null);

  // All thread data lives here and is passed down to both list and detail
  const {
    threads,
    upvotedIds,
    loading,
    error,
    refresh,
    toggleUpvoteLocally,
    prependThread,
    removeThread,
  } = useThreads();

  // ── Navigation handlers ───────────────────────────────────────────────────

  const openThread = (thread) => {
    setSelectedThread(thread);
    setView(VIEW.DETAIL);
  };

  const openCreate = () => {
    setView(VIEW.CREATE);
  };

  const goBackToList = () => {
    setSelectedThread(null);
    setView(VIEW.LIST);
  };

  const handleThreadCreated = (newThread) => {
    prependThread(newThread);
    setSelectedThread(newThread);
    setView(VIEW.DETAIL);
  };

  const handleThreadDeleted = (threadId) => {
    removeThread(threadId);
    goBackToList();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (view === VIEW.CREATE) {
    return (
      <CreateThreadScreen
        onBack={goBackToList}
        onThreadCreated={handleThreadCreated}
      />
    );
  }

  if (view === VIEW.DETAIL && selectedThread) {
    return (
      <ThreadDetailScreen
        thread={selectedThread}
        isThreadUpvoted={upvotedIds.has(selectedThread.id)}
        onThreadUpvoteToggle={toggleUpvoteLocally}
        onBack={goBackToList}
        onThreadDeleted={handleThreadDeleted}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ThreadList
        threads={threads}
        upvotedIds={upvotedIds}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onUpvoteToggle={toggleUpvoteLocally}
        onThreadPress={openThread}
        onCreatePress={openCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f4',
  },
});