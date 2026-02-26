import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import PostCard from './PostCard';
import SavedLooks from './SavedLooks';
import { usePosts } from '../hooks/usePosts';

const BRAND = '#5D1F1F';

/**
 * ProfileTabs
 *
 * Props:
 *   viewedUserId  — whose posts to load
 *   isOwnProfile  — hides the Favorites tab when viewing another user
 */
export default function ProfileTabs({ viewedUserId, isOwnProfile }) {
  const [activeTab, setActiveTab] = useState('posts');

  // Fetch posts for whichever user we're viewing
  const { posts, loading, refresh } = usePosts(viewedUserId);

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        if (loading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          );
        }
        if (posts.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                {isOwnProfile
                  ? 'Share your first hairstyle to inspire others!'
                  : "This user hasn't posted yet."}
              </Text>
            </View>
          );
        }
        return (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PostCard post={item} />}
            refreshing={loading}
            onRefresh={refresh}
          />
        );

      case 'activity':
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Activity</Text>
            <Text style={styles.emptyText}>Recent activity will appear here</Text>
          </View>
        );

      case 'favorites':
        // Only reachable on own profile since the tab is conditionally rendered
        return <SavedLooks />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            Posts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>

        {/* Favorites only visible on your own profile */}
        {isOwnProfile && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favorites
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: BRAND,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});