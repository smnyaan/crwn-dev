import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { postService } from '../services/postService';
import { collectionService } from '../services/collectionService';
import { supabase } from '../config/supabase';
import PostCard from './PostCard';

const NUM_COLS = 3;
const screenWidth = Dimensions.get('window').width;
const tileSize = screenWidth / NUM_COLS;
const BRAND = '#5D1F1F';

const ALL_SAVED = '__all__';

export default function SavedLooks({ headerComponent }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation();
  const channelRef = useRef(null);

  // All saved posts
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collections
  const [collections, setCollections] = useState([]);
  const [activeGroup, setActiveGroup] = useState(ALL_SAVED);

  // Post IDs in each collection  { [collectionId]: Set<postId> }
  const [membershipMap, setMembershipMap] = useState({});

  // Modals
  const [selectedPost, setSelectedPost] = useState(null);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [addPostsVisible, setAddPostsVisible] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState(new Set());
  const [groupMenuTarget, setGroupMenuTarget] = useState(null); // collection for rename/delete menu
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = async () => {
    if (!user?.id) return;
    const [bookmarksRes, collectionsRes, membershipsRes] = await Promise.all([
      postService.getBookmarkedPosts(user.id),
      collectionService.getCollections(user.id),
      collectionService.getAllCollectionMemberships(user.id),
    ]);

    if (!bookmarksRes.error) {
      setAllPosts(bookmarksRes.data?.map(b => b.posts).filter(Boolean) || []);
    }
    if (!collectionsRes.error) {
      setCollections(collectionsRes.data || []);
    }
    if (!membershipsRes.error) {
      const map = {};
      for (const { collection_id, post_id } of (membershipsRes.data || [])) {
        if (!map[collection_id]) map[collection_id] = new Set();
        map[collection_id].add(post_id);
      }
      setMembershipMap(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchAll();

    // Realtime: re-fetch on any bookmark change
    const channel = supabase
      .channel(`bookmarks:${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'bookmarks',
        filter: `user_id=eq.${user.id}`,
      }, fetchAll)
      .subscribe();

    channelRef.current = channel;
    return () => { channelRef.current?.unsubscribe(); channelRef.current = null; };
  }, [user?.id]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const displayedPosts = activeGroup === ALL_SAVED
    ? allPosts
    : allPosts.filter(p => membershipMap[activeGroup]?.has(p.id));

  // ── Collection actions ─────────────────────────────────────────────────────

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    setSaving(true);
    const { data, error } = await collectionService.createCollection(user.id, name);
    if (!error && data) {
      setCollections(prev => [...prev, data]);
      setActiveGroup(data.id);
    }
    setNewGroupName('');
    setCreateGroupVisible(false);
    setSaving(false);
  };

  const handleRenameGroup = async () => {
    const name = renameText.trim();
    if (!name || !groupMenuTarget) return;
    setSaving(true);
    const { error } = await collectionService.renameCollection(groupMenuTarget.id, name);
    if (!error) {
      setCollections(prev => prev.map(c => c.id === groupMenuTarget.id ? { ...c, name } : c));
    }
    setRenameVisible(false);
    setGroupMenuTarget(null);
    setSaving(false);
  };

  const handleDeleteGroup = async (collection) => {
    Alert.alert(
      `Delete "${collection.name}"?`,
      'Posts will not be deleted — only this group.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await collectionService.deleteCollection(collection.id);
            setCollections(prev => prev.filter(c => c.id !== collection.id));
            setMembershipMap(prev => { const m = { ...prev }; delete m[collection.id]; return m; });
            if (activeGroup === collection.id) setActiveGroup(ALL_SAVED);
          },
        },
      ]
    );
  };

  // ── Add posts to group ─────────────────────────────────────────────────────

  const openAddPosts = () => {
    setSelectedToAdd(new Set());
    setAddPostsVisible(true);
  };

  const toggleAddPost = (postId) => {
    setSelectedToAdd(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const confirmAddPosts = async () => {
    if (!selectedToAdd.size) { setAddPostsVisible(false); return; }
    setSaving(true);
    await Promise.all(
      [...selectedToAdd].map(postId =>
        collectionService.addPostToCollection(activeGroup, postId, user.id)
      )
    );
    // Update local membership map
    setMembershipMap(prev => {
      const next = { ...prev };
      if (!next[activeGroup]) next[activeGroup] = new Set();
      next[activeGroup] = new Set([...next[activeGroup], ...selectedToAdd]);
      return next;
    });
    setAddPostsVisible(false);
    setSaving(false);
  };

  const handleRemoveFromGroup = async (postId) => {
    await collectionService.removePostFromCollection(activeGroup, postId);
    setMembershipMap(prev => {
      const next = { ...prev };
      if (next[activeGroup]) {
        next[activeGroup] = new Set([...next[activeGroup]].filter(id => id !== postId));
      }
      return next;
    });
    setSelectedPost(null);
  };

  // ── Unbookmark ─────────────────────────────────────────────────────────────

  const handleUnbookmark = (postId) => {
    setAllPosts(prev => prev.filter(p => p.id !== postId));
    setSelectedPost(null);
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderTile = (item, selectable = false) => {
    const firstImage = item.post_media?.[0]?.media_url;
    const inGroup = selectable && membershipMap[activeGroup]?.has(item.id);
    const isSelected = selectedToAdd.has(item.id);

    if (selectable) {
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.tile}
          onPress={() => toggleAddPost(item.id)}
          activeOpacity={0.75}
        >
          {firstImage
            ? <Image source={{ uri: firstImage }} style={styles.image} resizeMode="cover" />
            : <View style={[styles.image, styles.placeholder]} />}
          {inGroup && (
            <View style={styles.alreadyInGroup}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          )}
          {isSelected && (
            <View style={styles.selectedOverlay}>
              <Ionicons name="checkmark-circle" size={28} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.tile}
        onPress={() => setSelectedPost(item)}
        activeOpacity={0.8}
      >
        {firstImage
          ? <Image source={{ uri: firstImage }} style={styles.image} resizeMode="cover" />
          : <View style={[styles.image, styles.placeholder]}><Ionicons name="image-outline" size={32} color={colors.textMuted} /></View>}
      </TouchableOpacity>
    );
  };

  const buildGrid = (posts, selectable = false) => {
    const rows = [];
    for (let i = 0; i < posts.length; i += NUM_COLS) {
      rows.push(posts.slice(i, i + NUM_COLS));
    }
    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.gridRow}>
        {row.map(item => renderTile(item, selectable))}
        {row.length < NUM_COLS && [...Array(NUM_COLS - row.length)].map((_, i) => (
          <View key={`e-${i}`} style={styles.tile} />
        ))}
      </View>
    ));
  };

  // ── Loading / empty ────────────────────────────────────────────────────────

  if (loading) {
    return <ActivityIndicator style={{ paddingTop: 60 }} size="large" color={BRAND} />;
  }

  if (allPosts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No saved posts yet</Text>
        <Text style={styles.emptyText}>Tap the bookmark icon on any post to save it</Text>
      </View>
    );
  }

  const activeCollection = collections.find(c => c.id === activeGroup);

  return (
    <View>
      {headerComponent}

      {/* ── Group tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.groupsBar}
        contentContainerStyle={styles.groupsContent}
      >
        {/* All Saved — always first */}
        <TouchableOpacity
          style={[styles.groupTab, activeGroup === ALL_SAVED && styles.groupTabActive]}
          onPress={() => setActiveGroup(ALL_SAVED)}
        >
          <Text style={[styles.groupTabText, activeGroup === ALL_SAVED && styles.groupTabTextActive]}>
            All Saved
          </Text>
        </TouchableOpacity>

        {/* User-created collections */}
        {collections.map(col => (
          <TouchableOpacity
            key={col.id}
            style={[styles.groupTab, activeGroup === col.id && styles.groupTabActive]}
            onPress={() => setActiveGroup(col.id)}
            onLongPress={() => { setGroupMenuTarget(col); }}
          >
            <Text style={[styles.groupTabText, activeGroup === col.id && styles.groupTabTextActive]}>
              {col.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* New group button */}
        <TouchableOpacity
          style={styles.newGroupBtn}
          onPress={() => { setNewGroupName(''); setCreateGroupVisible(true); }}
        >
          <Ionicons name="add" size={18} color={BRAND} />
          <Text style={styles.newGroupText}>New Group</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Posts grid ── */}
      {displayedPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No posts in this group</Text>
          <Text style={styles.emptyText}>Tap "Add Posts" to add some</Text>
        </View>
      ) : (
        <View style={styles.gridContent}>{buildGrid(displayedPosts)}</View>
      )}

      {/* ── Add posts button (non-all groups only) ── */}
      {activeGroup !== ALL_SAVED && (
        <TouchableOpacity style={styles.addPostsBtn} onPress={openAddPosts}>
          <Ionicons name="add-circle-outline" size={16} color={BRAND} />
          <Text style={styles.addPostsBtnText}>Add Posts</Text>
        </TouchableOpacity>
      )}

      {/* ── Group long-press menu ── */}
      <Modal
        visible={!!groupMenuTarget && !renameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGroupMenuTarget(null)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setGroupMenuTarget(null)}>
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>{groupMenuTarget?.name}</Text>
            <TouchableOpacity style={styles.menuRow} onPress={() => {
              setRenameText(groupMenuTarget?.name || '');
              setRenameVisible(true);
            }}>
              <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.menuRowText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => {
              const target = groupMenuTarget;
              setGroupMenuTarget(null);
              handleDeleteGroup(target);
            }}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text style={[styles.menuRowText, { color: '#ef4444' }]}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── Rename group modal ── */}
      <Modal
        visible={renameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setRenameVisible(false)}>
          <Pressable style={styles.inputSheet} onPress={() => {}}>
            <Text style={styles.inputSheetTitle}>Rename Group</Text>
            <TextInput
              style={styles.nameInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Group name"
              placeholderTextColor={colors.placeholder}
              autoFocus
              maxLength={40}
            />
            <View style={styles.inputSheetActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRenameVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !renameText.trim() && styles.confirmBtnDisabled]}
                onPress={handleRenameGroup}
                disabled={!renameText.trim() || saving}
              >
                <Text style={styles.confirmBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Create group modal ── */}
      <Modal
        visible={createGroupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateGroupVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setCreateGroupVisible(false)}>
          <Pressable style={styles.inputSheet} onPress={() => {}}>
            <Text style={styles.inputSheetTitle}>New Group</Text>
            <TextInput
              style={styles.nameInput}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Group name"
              placeholderTextColor={colors.placeholder}
              autoFocus
              maxLength={40}
            />
            <View style={styles.inputSheetActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateGroupVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !newGroupName.trim() && styles.confirmBtnDisabled]}
                onPress={handleCreateGroup}
                disabled={!newGroupName.trim() || saving}
              >
                <Text style={styles.confirmBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Add posts to group modal ── */}
      <Modal
        visible={addPostsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddPostsVisible(false)}
      >
        <SafeAreaView style={styles.addPostsSheet} edges={['top']}>
          <View style={styles.addPostsHeader}>
            <TouchableOpacity onPress={() => setAddPostsVisible(false)}>
              <Text style={styles.addPostsCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.addPostsTitle}>Add to "{activeCollection?.name}"</Text>
            <TouchableOpacity onPress={confirmAddPosts} disabled={saving}>
              <Text style={[styles.addPostsDone, !selectedToAdd.size && { opacity: 0.4 }]}>
                Add{selectedToAdd.size > 0 ? ` (${selectedToAdd.size})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.gridContent}>{buildGrid(allPosts, true)}</View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── Post detail modal ── */}
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPost(null)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedPost(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            {activeGroup !== ALL_SAVED && (
              <TouchableOpacity
                style={styles.removeFromGroupBtn}
                onPress={() => selectedPost && handleRemoveFromGroup(selectedPost.id)}
              >
                <Text style={styles.removeFromGroupText}>Remove from group</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedPost && (
              <PostCard
                post={selectedPost}
                currentUserId={user?.id}
                onBookmarkChange={(postId, isNowBookmarked) => {
                  if (!isNowBookmarked) handleUnbookmark(postId);
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

const makeStyles = (c) => StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 17, fontFamily: 'Figtree_600SemiBold', color: c.text },
  emptyText: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },

  // ── Group tabs ──
  groupsBar: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
  groupsContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8, alignItems: 'center' },
  groupTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  groupTabActive: { backgroundColor: BRAND, borderColor: BRAND },
  groupTabText: { fontSize: 13, fontFamily: 'Figtree_500Medium', color: c.textSecondary },
  groupTabTextActive: { color: '#fff', fontFamily: 'Figtree_600SemiBold' },
  newGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND,
    backgroundColor: c.surface,
  },
  newGroupText: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: BRAND },

  // ── Grid ──
  gridContent: { paddingBottom: 80 },
  gridRow: { flexDirection: 'row' },
  tile: { width: tileSize, height: tileSize, padding: 1, position: 'relative' },
  image: { width: '100%', height: '100%', backgroundColor: c.borderLight, borderRadius: 4 },
  placeholder: { backgroundColor: c.border, justifyContent: 'center', alignItems: 'center' },

  // ── Selection overlays ──
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(93,31,31,0.45)',
    margin: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alreadyInGroup: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BRAND,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Add posts button ──
  addPostsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND,
  },
  addPostsBtnText: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: BRAND },

  // ── Group menu ──
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingTop: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: c.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
    marginBottom: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  menuRowText: { fontSize: 16, fontFamily: 'Figtree_500Medium', color: c.text },

  // ── Name input sheet ──
  inputSheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 34,
  },
  inputSheetTitle: {
    fontSize: 17,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: c.text,
    marginBottom: 16,
    backgroundColor: c.inputBackground,
  },
  inputSheetActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontFamily: 'Figtree_600SemiBold', color: c.textSecondary },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: BRAND,
    alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: c.border },
  confirmBtnText: { fontSize: 15, fontFamily: 'Figtree_600SemiBold', color: '#fff' },

  // ── Add posts sheet ──
  addPostsSheet: { flex: 1, backgroundColor: c.surface },
  addPostsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  addPostsCancel: { fontSize: 15, color: c.textSecondary, fontFamily: 'Figtree_500Medium' },
  addPostsTitle: { fontSize: 15, fontFamily: 'Figtree_700Bold', color: c.text },
  addPostsDone: { fontSize: 15, color: BRAND, fontFamily: 'Figtree_700Bold' },

  // ── Post modal ──
  modalSafe: { flex: 1, backgroundColor: c.surface },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.borderLight,
  },
  removeFromGroupBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: c.primaryLight,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeFromGroupText: { fontSize: 13, color: '#ef4444', fontFamily: 'Figtree_600SemiBold' },
});
