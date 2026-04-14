import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ThreadCard from './ThreadCard';
import SearchBar from './SearchBar';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { HEADER_BAR_HEIGHT } from './ScreenHeader';

const BRAND   = '#5D1F1F';
const FILTERS = ['All', 'Low Porosity', 'High Porosity', 'Protective Styles', 'Styling Tips', 'Beginner'];

export default function ThreadList({
  threads = [],
  upvotedIds = new Set(),
  loading = false,
  error = null,
  onRefresh,
  onUpvoteToggle,
  onThreadPress,
  onCreatePress,
}) {
  const navigation   = useNavigation();
  const unreadCount  = useUnreadMessages();

  const [searchOpen, setSearchOpen]     = useState(false);
  const [search, setSearch]             = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const toggleSearch = useCallback(() => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearch('');
      requestAnimationFrame(() => Keyboard.dismiss());
    } else {
      setSearchOpen(true);
    }
  }, [searchOpen]);

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      const matchesCategory = activeFilter === 'All' || t.category === activeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.body?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [threads, activeFilter, search]);

  // ── List header (search bar + filter chips) ───────────────────────────────

  const ListHeader = (
    <>
      {searchOpen && (
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search discussions..."
          autoFocus
        />
      )}

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => {
          const active = item === activeFilter;
          return (
            <TouchableOpacity
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </>
  );

  const renderEmpty = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.centerMessage}>
          <Ionicons name="cloud-offline-outline" size={40} color="#d1d5db" />
          <Text style={styles.centerText}>Couldn't load discussions</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centerMessage}>
        <Ionicons name="chatbubbles-outline" size={40} color="#d1d5db" />
        <Text style={styles.centerText}>No discussions found</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerIcon}
          onPress={toggleSearch}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={searchOpen ? 'close-outline' : 'search-outline'}
            size={22}
            color="#111827"
          />
        </Pressable>

        <Text style={styles.headerLogo} pointerEvents="none">crwn.</Text>

        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Messaging')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#111827" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Thread list ── */}
      {loading && threads.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <ThreadCard
              thread={item}
              isUpvoted={upvotedIds.has(item.id)}
              onUpvoteToggle={onUpvoteToggle}
              onPress={() => onThreadPress?.(item)}
            />
          )}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshing={loading}
          onRefresh={onRefresh}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={onCreatePress}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },

  // ── Header (mirrors ExploreScreen) ──
  header: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    cursor: 'pointer',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Figtree_700Bold',
    lineHeight: 12,
  },

  // ── Filter chips ──
  filterList: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FCFCFC',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  filterText: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Figtree_500Medium',
  },
  filterTextActive: {
    color: '#fff',
    fontFamily: 'Figtree_600SemiBold',
  },

  // ── List ──
  listContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  centerMessage: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  centerText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: BRAND,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
