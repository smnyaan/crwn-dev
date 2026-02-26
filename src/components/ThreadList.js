import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThreadCard from './ThreadCard';

const BRAND  = '#5D1F1F';
const FILTERS = ['All', 'Low Porosity', 'High Porosity', 'Protective Styles', 'Styling Tips', 'Beginner'];

/**
 * ThreadList
 *
 * All data comes from CommunityScreen (which owns useThreads) so upvote state
 * stays in sync between the list and detail views.
 *
 * Props:
 *   threads[]          — array of Supabase thread rows
 *   upvotedIds         — Set<threadId> of threads the user has upvoted
 *   loading            — boolean
 *   error              — error object or null
 *   onRefresh()        — pull-to-refresh callback
 *   onUpvoteToggle(id, isNowUpvoted) — bubble up to CommunityScreen
 *   onThreadPress(thread)
 *   onCreatePress()
 */
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
  const [search, setSearch]             = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Client-side filter — no extra Supabase calls on every keystroke
  const filtered = useMemo(() => {
    return threads.filter((t) => {
      const matchesCategory =
        activeFilter === 'All' || t.category === activeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.body?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [threads, activeFilter, search]);

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderThread = ({ item }) => (
    <ThreadCard
      thread={item}
      isUpvoted={upvotedIds.has(item.id)}
      onUpvoteToggle={onUpvoteToggle}
      onPress={() => onThreadPress?.(item)}
    />
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

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            placeholderTextColor="#b0b0b0"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Filter Chips */}
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
        style={styles.filterRow}
      />

      {/* Loading spinner on first load */}
      {loading && threads.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          renderItem={renderThread}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshing={loading}
          onRefresh={onRefresh}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onCreatePress}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f6f4',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  filterRow: {
    flexGrow: 0,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  filterText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingTop: 4,
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
    fontWeight: '600',
  },
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