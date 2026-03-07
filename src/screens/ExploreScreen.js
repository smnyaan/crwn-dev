import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import RecommendationSlider from '../components/RecommendationSlider';
import PostList from '../components/PostList';
import { usePosts } from '../hooks/usePosts';
import { useNavigation } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_SPACING = 2;
const NUM_COLUMNS = 2;
const TILE_SIZE = (SCREEN_WIDTH - (GRID_SPACING * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

export default function ExploreScreen() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState('list');
  const [query, setQuery] = useState('');
  const [searchBarHeight, setSearchBarHeight] = useState(68);

  const { posts, loading, refresh, deletePost, updatePost } = usePosts();

  const isSearching = query.trim().length > 0;

  // Filter posts by caption, username, or full name (case-insensitive)
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

  // Derive unique matching users for the dropdown People section
  const matchingUsers = isSearching
    ? [
        ...new Map(
          filteredPosts
            .filter((p) => p.profiles)
            .map((p) => [p.user_id, { userId: p.user_id, ...p.profiles }])
        ).values(),
      ].slice(0, 5)
    : [];

  // Posts matching by caption/description for the dropdown Posts section
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

  const handleSelectResult = (userId) => {
    setQuery('');
    navigation.navigate('UserProfile', { viewedUserId: userId });
  };

  const toggleView = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };

  const renderGridItem = ({ item }) => {
    const firstImage = item.post_media?.[0]?.media_url;
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate('UserProfile', { viewedUserId: item.user_id })}
      >
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.gridImage} resizeMode="cover" />
        ) : (
          <View style={styles.gridImage} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Search area (zIndex keeps dropdown above content) ── */}
      <View
        style={styles.searchArea}
        onLayout={(e) => setSearchBarHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <SearchBar value={query} onChangeText={setQuery} />
          </View>
          <TouchableOpacity style={styles.viewToggle} onPress={toggleView}>
            <Ionicons
              name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
              size={24}
              color="#111827"
            />
          </TouchableOpacity>
        </View>

        {/* ── Dropdown ── */}
        {isSearching && (
          <View style={[styles.dropdown, { top: searchBarHeight }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 320 }}
            >
              {/* People */}
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
                        <Text style={styles.dropdownUsername}>
                          @{u.username || 'user'}
                        </Text>
                        {u.full_name ? (
                          <Text style={styles.dropdownMeta}>{u.full_name}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Posts */}
              {matchingPosts.length > 0 && (
                <>
                  <Text style={styles.dropdownSection}>Posts</Text>
                  {matchingPosts.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.dropdownRow}
                      onPress={() => handleSelectResult(p.user_id)}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color="#9ca3af"
                        style={styles.dropdownPostIcon}
                      />
                      <View style={styles.dropdownRowText}>
                        <Text style={styles.dropdownCaption} numberOfLines={1}>
                          {p.caption || p.description || 'Post'}
                        </Text>
                        <Text style={styles.dropdownMeta}>
                          by @{p.profiles?.username || 'user'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* No results */}
              {matchingUsers.length === 0 && matchingPosts.length === 0 && (
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>
                    No results for "{query}"
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── Main content ── */}
      {viewMode === 'list' && !isSearching && <RecommendationSlider />}

      {viewMode === 'list' ? (
        <PostList
          posts={filteredPosts}
          loading={loading}
          refresh={refresh}
          deletePost={deletePost}
          updatePost={updatePost}
        />
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Wraps search bar + dropdown; zIndex ensures dropdown floats above content
  searchArea: {
    zIndex: 100,
    elevation: 100,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  searchBarWrapper: {
    flex: 1,
  },
  viewToggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // ── Dropdown ──
  dropdown: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: '#fff',
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
    fontWeight: '700',
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
  dropdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  dropdownAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownPostIcon: {
    marginRight: 12,
  },
  dropdownRowText: {
    flex: 1,
  },
  dropdownUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dropdownCaption: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dropdownMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  dropdownEmpty: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  // ── Grid ──
  gridContainer: {
    padding: GRID_SPACING,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: TILE_SIZE,
    height: TILE_SIZE * 1.3,
    marginBottom: GRID_SPACING,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});