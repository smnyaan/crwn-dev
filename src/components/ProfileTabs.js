import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import SavedLooks from './SavedLooks';
import HairProfile from './HairProfile';
import PostCard from './PostCard';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';

const BRAND = '#5D1F1F';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const GRID_SIZE = (SCREEN_WIDTH - 4) / 3;

const TABS = [
  { key: 'posts',     label: 'Posts' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'bookings',  label: 'Bookings' },
  { key: 'hair',      label: 'Hair', lock: true },
];

export default function ProfileTabs({ viewedUserId, isOwnProfile }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null);
  const { user } = useAuth();
  const { posts, loading, refresh, deletePost } = usePosts(viewedUserId);

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        if (loading) {
          return <ActivityIndicator style={{ paddingTop: 60 }} size="large" color={BRAND} />;
        }
        if (posts.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                {isOwnProfile ? 'Share your first hairstyle!' : "This user hasn't posted yet."}
              </Text>
            </View>
          );
        }
        return (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => {
              const thumb = item.post_media?.[0]?.media_url;
              return (
                <TouchableOpacity style={styles.gridCell} onPress={() => setSelectedPost(item)} activeOpacity={0.8}>
                  {thumb ? (
                    <Image source={{ uri: thumb }} style={styles.gridImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.gridImage, styles.gridPlaceholder]}>
                      <Icon name="image-outline" size={20} color="#9ca3af" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            refreshing={loading}
            onRefresh={refresh}
          />
        );

      case 'favorites':
        return <SavedLooks />;

      case 'bookings':
        return (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={40} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>Your appointments will appear here</Text>
          </View>
        );

      case 'hair':
        if (!isOwnProfile) {
          return (
            <View style={styles.emptyState}>
              <Icon name="lock-closed-outline" size={40} color="#d1d5db" />
              <Text style={styles.emptyTitle}>Private</Text>
              <Text style={styles.emptyText}>Hair profile is only visible to the owner</Text>
            </View>
          );
        }
        return <HairProfile viewedUserId={viewedUserId} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <View style={styles.tabLabelRow}>
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
              {tab.lock && (
                <Icon name="lock-closed" size={11} color={activeTab === tab.key ? BRAND : '#9ca3af'} style={{ marginLeft: 3 }} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>{renderContent()}</View>

      {/* Post detail popup */}
      <Modal
        visible={!!selectedPost}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPost(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelectedPost(null)}>
          <Pressable style={styles.popupCard} onPress={() => {}}>
            <PostCard
              post={selectedPost}
              currentUserId={user?.id}
              onDelete={async (postId, userId) => {
                const result = await deletePost(postId, userId);
                if (result?.success) setSelectedPost(null);
                return result;
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: BRAND,
    fontWeight: '600',
  },
  content: { flex: 1 },
  gridContainer: { padding: 1 },
  gridRow: { gap: 2, marginBottom: 2 },
  gridCell: { width: GRID_SIZE, height: GRID_SIZE },
  gridImage: { width: '100%', height: '100%', borderRadius: 8 },
  gridPlaceholder: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  popupCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.78,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
});
