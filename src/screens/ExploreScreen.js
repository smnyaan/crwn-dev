import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Keyboard,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import PostCard from '../components/PostCard';
import { HEADER_BAR_HEIGHT } from '../components/ScreenHeader';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

const COL_GAP = 10;
const SIDE_PAD = 12;

// Deterministic varying heights so layout is stable across renders
const IMAGE_HEIGHTS = [220, 140, 170, 260, 190, 240, 160, 280, 200, 230, 175, ];
const getImageHeight = (index) => IMAGE_HEIGHTS[index % IMAGE_HEIGHTS.length];

export default function ExploreScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const { posts, loading, refresh, deletePost } = usePosts();

  const isSearching = query.trim().length > 0;

  const filteredPosts = isSearching
    ? posts.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.caption?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.profiles?.username?.toLowerCase().includes(q) ||
          p.profiles?.full_name?.toLowerCase().includes(q)
        );
      })
    : posts;

  // Split into two columns
  const leftCol = filteredPosts.filter((_, i) => i % 2 === 0);
  const rightCol = filteredPosts.filter((_, i) => i % 2 === 1);

  // Search dropdown data
  const matchingUsers = isSearching
    ? [
        ...new Map(
          filteredPosts
            .filter((p) => p.profiles)
            .map((p) => [p.user_id, { userId: p.user_id, ...p.profiles }])
        ).values(),
      ].slice(0, 5)
    : [];

  const matchingPosts = isSearching
    ? filteredPosts
        .filter((p) => {
          const q = query.toLowerCase();
          return (
            p.caption?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const openSearch = () => setSearchOpen(true);

  const closeSearch = () => {
    Keyboard.dismiss();
    setQuery('');
    setSearchOpen(false);
  };

  const handleSelectResult = (userId) => {
    closeSearch();
    navigation.navigate('UserProfile', { viewedUserId: userId });
  };

  const renderTile = (item) => {
    const globalIndex = filteredPosts.indexOf(item);
    const imgHeight = getImageHeight(globalIndex);
    const firstImage = item.post_media?.[0]?.media_url;
    const stylistName = item.stylists?.business_name || item.stylists?.username;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.tile}
        onPress={() => setSelectedPost(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.tileImage, { height: imgHeight }]}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.tileImagePlaceholder} />
          )}
          {stylistName ? (
            <View style={styles.stylistTag}>
              <Ionicons name="cut-outline" size={10} color="#5D1F1F" />
              <Text style={styles.stylistTagText} numberOfLines={1}>{stylistName}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={searchOpen ? closeSearch : openSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={searchOpen ? 'close-outline' : 'search-outline'} size={22} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerLogo}>crwn.</Text>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Messaging')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Collapsible Search ── */}
      <View style={styles.searchAreaWrapper}>
        {searchOpen && (
          <View style={styles.searchBarRow}>
            <SearchBar value={query} onChangeText={setQuery} />
          </View>
        )}

        {searchOpen && isSearching && (
          <View style={styles.dropdown}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 300 }}
            >
              {matchingUsers.length > 0 && (
                <>
                  <Text style={styles.dropdownSection}>People</Text>
                  {matchingUsers.map((u) => (
                    <TouchableOpacity
                      key={u.userId}
                      style={styles.dropdownRow}
                      onPress={() => handleSelectResult(u.userId)}
                    >
                      {u.avatar_url ? (
                        <Image source={{ uri: u.avatar_url }} style={styles.dropdownAvatar} />
                      ) : (
                        <View style={styles.dropdownAvatarPlaceholder}>
                          <Ionicons name="person" size={16} color="#9ca3af" />
                        </View>
                      )}
                      <View style={styles.dropdownRowText}>
                        <Text style={styles.dropdownUsername}>@{u.username || 'user'}</Text>
                        {u.full_name ? <Text style={styles.dropdownMeta}>{u.full_name}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {matchingPosts.length > 0 && (
                <>
                  <Text style={styles.dropdownSection}>Posts</Text>
                  {matchingPosts.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.dropdownRow}
                      onPress={() => handleSelectResult(p.user_id)}
                    >
                      <Ionicons name="document-text-outline" size={18} color="#9ca3af" style={{ marginRight: 12 }} />
                      <View style={styles.dropdownRowText}>
                        <Text style={styles.dropdownCaption} numberOfLines={1}>
                          {p.caption || p.description || 'Post'}
                        </Text>
                        <Text style={styles.dropdownMeta}>by @{p.profiles?.username || 'user'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {matchingUsers.length === 0 && matchingPosts.length === 0 && (
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>No results for "{query}"</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── Masonry Grid ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#5D1F1F" />}
      >
        <View style={styles.leftCol}>
          {leftCol.map((item) => renderTile(item))}
        </View>
        <View style={styles.rightCol}>
          {rightCol.map((item) => renderTile(item))}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ── Full Post Modal ── */}
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPost(null)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedPost(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedPost && (
              <PostCard
                post={selectedPost}
                currentUserId={user?.id}
                onDelete={async (postId, userId) => {
                  const result = await deletePost(postId, userId);
                  if (result?.success) setSelectedPost(null);
                  return result;
                }}
                onNavigateToProfile={(userId) => {
                  setSelectedPost(null);
                  navigation.navigate('UserProfile', { viewedUserId: userId });
                }}
                onNavigateToStylist={(stylistId) => {
                  setSelectedPost(null);
                  navigation.navigate('UserProfile', { viewedUserId: stylistId });
                }}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },
  safeHeader: { backgroundColor: '#FCFCFC' },

  // ── Header ──
  header: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: '#C0C0C0',
    backgroundColor: '#FCFCFC',
  },
  headerLogo: {
    fontSize: 24,
    fontFamily: 'LibreBaskerville_700Bold',
    color: '#111827',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Search ──
  searchAreaWrapper: {
    zIndex: 100,
    elevation: 100,
    backgroundColor: '#FCFCFC',
  },
  searchBarRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 12,
    right: 12,
    backgroundColor: '#FCFCFC',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0ece8',
  },
  dropdownSection: {
    fontSize: 11,
    fontFamily: 'Figtree_700Bold',
    color: '#9ca3af',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  dropdownAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownRowText: { flex: 1 },
  dropdownUsername: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#111827' },
  dropdownCaption: { fontSize: 14, fontFamily: 'Figtree_500Medium', color: '#111827' },
  dropdownMeta: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  dropdownEmpty: { paddingHorizontal: 16, paddingVertical: 20, alignItems: 'center' },
  dropdownEmptyText: { fontSize: 14, color: '#9ca3af' },

  // ── Masonry ──
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: SIDE_PAD,
    paddingTop: 12,
    paddingBottom: 100,
    gap: COL_GAP,
  },
  leftCol: { flex: 1, gap: 16 },
  rightCol: { flex: 1, gap: 16 },

  tile: { width: '100%' },
  tileImage: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  tileImagePlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  stylistTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    maxWidth: '85%',
  },
  stylistTagText: {
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
    color: '#5D1F1F',
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5D1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    shadowColor: '#5D1F1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  // ── Post Modal ──
  modalSafe: { flex: 1, backgroundColor: '#FCFCFC' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
});
