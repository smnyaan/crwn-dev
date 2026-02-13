import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import PostCard from './PostCard';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const tileSize = screenWidth / numColumns;

export default function ProfileTabs({ userId, isOwnProfile = true }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  
  // Use provided userId or fall back to current user
  const targetUserId = userId || user?.id;
  
  // Fetch posts for the target user
  const { posts, loading, refresh, deletePost, updatePost } = usePosts(targetUserId);

  // State for bookmarked posts (only for own profile)
  const [bookmarkedPosts, setBookmarkedPosts] = React.useState([]);
  const [bookmarksLoading, setBookmarksLoading] = React.useState(false);

  // Fetch bookmarks when favorites tab is selected (only for own profile)
  React.useEffect(() => {
    if (activeTab === 'favorites' && isOwnProfile && user?.id) {
      fetchBookmarkedPosts();
    }
  }, [activeTab, isOwnProfile, user?.id]);

  const fetchBookmarkedPosts = async () => {
    if (!user?.id) return;
    
    setBookmarksLoading(true);
    const { data, error } = await postService.getBookmarkedPosts(user.id);
    
    if (error) {
      console.error('Error fetching bookmarks:', error);
    } else {
      const posts = data?.map(bookmark => bookmark.posts).filter(Boolean) || [];
      setBookmarkedPosts(posts);
    }
    setBookmarksLoading(false);
  };

  const renderGridItem = ({ item }) => {
    const firstImage = item.post_media?.[0]?.media_url;

    return (
      <TouchableOpacity style={styles.tile} activeOpacity={0.8}>
        {firstImage ? (
          <Image 
            source={{ uri: firstImage }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.gridImage, styles.placeholder]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        if (loading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5D1F1F" />
            </View>
          );
        }

        if (posts.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                {isOwnProfile 
                  ? "Share your first hairstyle to inspire others!"
                  : "This user hasn't posted anything yet."}
              </Text>
            </View>
          );
        }

        return (
          <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <PostCard 
                post={item}
                currentUserId={user?.id}
                onDelete={isOwnProfile ? deletePost : undefined}
                onUpdate={isOwnProfile ? updatePost : undefined}
              />
            )}
            refreshing={loading}
            onRefresh={refresh}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        );

      case 'activity':
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Activity</Text>
            <Text style={styles.emptyText}>
              {isOwnProfile 
                ? "Your recent activity will appear here"
                : "This user's activity will appear here"}
            </Text>
          </View>
        );

      case 'favorites':
        // Only show favorites for own profile
        if (!isOwnProfile) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Private</Text>
              <Text style={styles.emptyText}>
                Saved posts are only visible to the account owner.
              </Text>
            </View>
          );
        }

        if (bookmarksLoading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5D1F1F" />
            </View>
          );
        }

        if (bookmarkedPosts.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No saved posts yet</Text>
              <Text style={styles.emptyText}>
                Tap the bookmark icon on posts you want to save for later
              </Text>
            </View>
          );
        }

        return (
          <FlatList
            data={bookmarkedPosts}
            renderItem={renderGridItem}
            numColumns={numColumns}
            keyExtractor={item => item.id}
            style={styles.grid}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        );

      default:
        return null;
    }
  };

  // Determine which tabs to show
  const tabs = isOwnProfile 
    ? ['posts', 'activity', 'favorites']
    : ['posts', 'activity'];

  return (
    <View style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
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
    borderBottomColor: '#5D1F1F',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#5D1F1F',
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
  grid: {
    flex: 1,
  },
  tile: {
    width: tileSize,
    height: tileSize,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  placeholder: {
    backgroundColor: '#e5e7eb',
  },
});