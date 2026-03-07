import React from 'react';
import { FlatList, StyleSheet, RefreshControl, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PostCard from './PostCard';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';

export default function PostList({ posts: propPosts, loading: propLoading, refresh: propRefresh, deletePost: propDeletePost, updatePost: propUpdatePost }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const ownHook = usePosts();

  // Use props if provided by parent (e.g. ExploreScreen with search), else own fetch
  const posts       = propPosts       ?? ownHook.posts;
  const loading     = propLoading     ?? ownHook.loading;
  const refresh     = propRefresh     ?? ownHook.refresh;
  const deletePost  = propDeletePost  ?? ownHook.deletePost;
  const updatePost  = propUpdatePost  ?? ownHook.updatePost;

  const currentUserId = user?.id;

  const handleNavigateToProfile = (userId) => {
    // Navigate to user's profile (UserProfile screen in stack navigator)
    //navigation.navigate('UserProfile', { viewedUserId: userId });
    // If you clicked yourself, go to the Profile TAB (no params)
    if (userId === currentUserId) {
      navigation.navigate('Profile'); // tab
    } else {
       // Otherwise push onto the STACK so you get a back button
      navigation.navigate('UserProfile', { viewedUserId: userId }); // stack
    }
  };
    


  const handleNavigateToStylist = (stylistId) => {
    // Navigate to stylist's profile/page
    //navigation.navigate('UserProfile', { userId: stylistId});
    navigation.navigate('UserProfile', { viewedUserId: stylistId, isStylist: true });
  };

  if (posts.length === 0 && !loading) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share!</Text>
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
          currentUserId={currentUserId}
          onDelete={deletePost}
          onUpdate={updatePost}
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToStylist={handleNavigateToStylist}
        />
      )}
      style={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});