import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Alert,
  Share,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { postService } from '../services/postService';
import { collectionService } from '../services/collectionService';


export default function PostCard({
  post,
  currentUserId,
  onDelete,
  onBookmarkChange,
  onNavigateToProfile,
  onNavigateToStylist,
}) {
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const fadeTimer = useRef(null);
  const carouselRef = useRef(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState({});   // index → true when load fails
  const [menuVisible, setMenuVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [savePickerVisible, setSavePickerVisible] = useState(false);
  const [pickerCollections, setPickerCollections] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSaving, setPickerSaving] = useState(false);
  const [newCollectionMode, setNewCollectionMode] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const examplePost = {
    id: '1',
    images: ['placeholder.jpg'],
    title: 'Side Part Silk Press',
    description: 'Book with my stylist she never disappoints!',
    profiles: {
      id: 'user1',
      username: 'laila_hunte',
      full_name: 'Laila Hunte',
      avatar_url: null
    },
    created_at: new Date().toISOString(),
    stylists: {
      id: 'stylist1',
      username: 'beautyybyemme',
      business_name: 'Beauty by Emme'
    },
    rating: 5.0,
    likes_count: 306,
    comments_count: 30,
    post_media: []
  };

  const currentPost = post || examplePost;
  
  const { 
    id: postId,
    title,
    description,
    profiles,
    created_at,
    stylists,
    rating,
    likes_count,
    comments_count,
    post_media,
    user_id,
    likes: likesRelation,
    comments: commentsRelation,
  } = currentPost;

  const dbLikesCount = likesRelation?.[0]?.count ?? likes_count ?? 0;
  const dbCommentsCount = commentsRelation?.[0]?.count ?? comments_count ?? 0;

  // Get author info from profiles relation
  const authorName = profiles?.full_name || profiles?.username || 'Anonymous';
  const authorUsername = profiles?.username || 'user';
  const authorId = profiles?.id || user_id;
  const { user, profile: currentUserProfile } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const authorAvatar = authorId === user?.id ? (currentUserProfile?.avatar_url ?? profiles?.avatar_url) : profiles?.avatar_url;

  // Get stylist info
  const stylistDisplayName = stylists?.full_name || stylists?.username;
  const stylistId = stylists?.id;

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  const timeAgo = getTimeAgo(created_at);

  // Get media items
  const mediaItems = post_media?.map(media => ({ uri: media.media_url })) || [];

  // Check if current user owns this post
  const isOwnPost = currentUserId && (authorId === currentUserId || user_id === currentUserId);

  // Initialize like/bookmark state and counts from DB
  useEffect(() => {
    if (!user?.id || !postId || postId === '1') return;
    setLikesCount(dbLikesCount);
    postService.hasLiked(user.id, postId).then(({ liked }) => setLiked(liked));
    postService.hasBookmarked(user.id, postId).then(({ bookmarked }) => setBookmarked(bookmarked));
  }, [user?.id, postId]);

  const handleLike = async () => {
    if (!user?.id) return;
    if (liked) {
      setLiked(false);
      setLikesCount(c => c - 1);
      await postService.unlikePost(user.id, postId);
    } else {
      setLiked(true);
      setLikesCount(c => c + 1);
      await postService.likePost(user.id, postId);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id) return;
    if (bookmarked) {
      setBookmarked(false);
      await postService.removeBookmark(user.id, postId);
      onBookmarkChange?.(postId, false);
    } else {
      setNewCollectionMode(false);
      setNewCollectionName('');
      setSavePickerVisible(true);
      setPickerLoading(true);
      const { data } = await collectionService.getCollections(user.id);
      setPickerCollections(data || []);
      setPickerLoading(false);
    }
  };

  const handleSaveToCollection = async (collection) => {
    if (!user?.id) return;
    setPickerSaving(true);
    await postService.bookmarkPost(user.id, postId);
    setBookmarked(true);
    if (collection) {
      await collectionService.addPostToCollection(collection.id, postId, user.id);
    }
    setSavePickerVisible(false);
    onBookmarkChange?.(postId, true);
    setPickerSaving(false);
  };

  const handleCreateAndSave = async () => {
    const name = newCollectionName.trim();
    if (!name || !user?.id) return;
    setPickerSaving(true);
    const { data: newColl } = await collectionService.createCollection(user.id, name);
    await postService.bookmarkPost(user.id, postId);
    setBookmarked(true);
    if (newColl) {
      await collectionService.addPostToCollection(newColl.id, postId, user.id);
    }
    setSavePickerVisible(false);
    onBookmarkChange?.(postId, true);
    setPickerSaving(false);
  };

  const handleOpenComments = async () => {
    setCommentsVisible(true);
    setCommentsLoading(true);
    const { data } = await postService.getComments(postId);
    setComments(data || []);
    setCommentsLoading(false);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user?.id) return;
    setSubmittingComment(true);
    const { data, error } = await postService.addComment(user.id, postId, commentText.trim());
    if (error) {
      console.error('Comment insert failed:', JSON.stringify(error));
      Alert.alert('Error', error.message || 'Failed to post comment');
    } else if (data) {
      setComments(prev => [...prev, data]);
      setCommentText('');
    }
    setSubmittingComment(false);
  };

  const handleDeleteComment = (commentId) => {
    const doDelete = async () => {
      const { error } = await postService.deleteComment(commentId, user.id);
      if (!error) setComments(prev => prev.filter(c => c.id !== commentId));
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this comment?')) doDelete();
    } else {
      Alert.alert('Delete Comment', 'Delete this comment?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const showControls = () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    Animated.timing(controlsOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    fadeTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }, 2000);
  };

  const scrollTo = (index) => {
    carouselRef.current?.scrollTo({ x: index * slideWidth, animated: false });
    setCurrentIndex(index);
    showControls();
  };

  const handlePrev = () => scrollTo(Math.max(0, currentIndex - 1));
  const handleNext = () => scrollTo(Math.min(mediaItems.length - 1, currentIndex + 1));

  const handleProfilePress = () => {
    if (onNavigateToProfile && authorId) {
      onNavigateToProfile(authorId);
    }
  };

  const handleStylistPress = () => {
    if (onNavigateToStylist && stylistId) {
      onNavigateToStylist(stylistId);
    }
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleShare = async () => {
    setMenuVisible(false);
    try {
      await Share.share({
        message: `Check out this style: ${title}\n\nBy @${authorUsername} on CRWN`,
        title: title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };


  const performDelete = async () => {
    if (!onDelete) return;
    const result = await onDelete(postId, currentUserId);
    if (!result?.success) {
      if (Platform.OS === 'web') {
        window.alert('Failed to delete post. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to delete post');
      }
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this post? This cannot be undone.')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert('Report', 'This post has been reported for review.');
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileInfo}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          {authorAvatar ? (
            <Image 
              source={{ uri: authorAvatar }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {authorName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMenuPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Post Images Carousel */}
      {mediaItems.length > 0 && (
        <View
          style={styles.mediaContainer}
          onLayout={(e) => setSlideWidth(e.nativeEvent.layout.width)}
        >
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            bounces={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
              );
              setCurrentIndex(index);
              showControls();
            }}
          >
            {mediaItems.map((item, i) => {
              // On web `height: '100%'` can compute to 0 inside a horizontal ScrollView
              // when parent height is inferred from aspectRatio. Explicit px fixes it.
              const imgSize = slideWidth > 0 ? { width: slideWidth, height: slideWidth } : null;
              const failed  = imgErrors[i];
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={1}
                  onPress={showControls}
                  style={[styles.slide, slideWidth ? { width: slideWidth, height: slideWidth } : null]}
                >
                  {failed ? (
                    // Broken-image placeholder
                    <View style={[styles.image, imgSize, styles.imgError]}>
                      <Ionicons name="image-outline" size={36} color={colors.border} />
                    </View>
                  ) : (
                    <Image
                      source={item}
                      style={[styles.image, imgSize]}
                      resizeMode="cover"
                      onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {mediaItems.length > 1 && (
            <>
              <Animated.View style={[styles.carouselControls, { opacity: controlsOpacity }]} pointerEvents="box-none">
                <TouchableOpacity
                  style={[styles.arrowBtn, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
                  onPress={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View />
                <TouchableOpacity
                  style={[styles.arrowBtn, { opacity: currentIndex === mediaItems.length - 1 ? 0.3 : 1 }]}
                  onPress={handleNext}
                  disabled={currentIndex === mediaItems.length - 1}
                >
                  <Ionicons name="chevron-forward" size={22} color="#fff" />
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.photoDots} pointerEvents="none">
                {mediaItems.map((_, i) => (
                  <View key={i} style={[styles.photoDot, i === currentIndex && styles.photoDotActive]} />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.metadata}>
          {stylistDisplayName && (
            <TouchableOpacity style={styles.stylistChip} onPress={handleStylistPress} activeOpacity={0.7}>
              <Ionicons name="cut-outline" size={13} color={colors.primary} />
              <Text style={styles.stylistName}>{stylistDisplayName}</Text>
            </TouchableOpacity>
          )}
          {!!rating && (
            <Text style={styles.rating}>Rating: {rating} stars</Text>
          )}
        </View>

        {description && <Text style={styles.description}>{description}</Text>}

        {currentPost.tags?.length > 0 && (
          <Text style={styles.tagsRow}>
            {currentPost.tags.map(t => `#${t}`).join(' ')}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? "#ef4444" : colors.text} />
          <Text style={styles.actionText}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
          <Text style={styles.actionText}>{comments.length || dbCommentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.bookmarkButton]} onPress={handleBookmark}>
          <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={bookmarked ? colors.primary : colors.text} />
        </TouchableOpacity>
      </View>

      {/* Post Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHandle} />
            
            {/* Share Option - Always visible */}
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={colors.text} />
              <Text style={styles.menuItemText}>Share</Text>
            </TouchableOpacity>

            {isOwnPost ? (
              <>
                {/* Delete Option - Only for own posts */}
                <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={24} color="#ef4444" />
                  <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete Post</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Report Option - Only for others' posts */
              <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleReport}>
                <Ionicons name="flag-outline" size={24} color="#ef4444" />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Report Post</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.menuItem, styles.cancelButton]} 
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Add-to-collection banner */}
      <Modal
        visible={savePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSavePickerVisible(false)}
      >
        <Pressable style={styles.savePickerBackdrop} onPress={() => setSavePickerVisible(false)}>
          <Pressable style={styles.savePickerSheet} onPress={() => {}}>
            <View style={styles.savePickerHandle} />
            <Text style={styles.savePickerTitle}>Add to Collection</Text>

            {pickerLoading ? (
              <ActivityIndicator style={{ paddingVertical: 20 }} color={colors.primary} />
            ) : pickerSaving ? (
              <ActivityIndicator style={{ paddingVertical: 20 }} color={colors.primary} />
            ) : newCollectionMode ? (
              /* ── Inline new-collection form ── */
              <View style={styles.newCollForm}>
                <TextInput
                  style={styles.newCollInput}
                  placeholder="Collection name"
                  placeholderTextColor={colors.placeholder}
                  value={newCollectionName}
                  onChangeText={setNewCollectionName}
                  autoFocus
                  maxLength={40}
                  returnKeyType="done"
                  onSubmitEditing={handleCreateAndSave}
                />
                <View style={styles.newCollActions}>
                  <TouchableOpacity
                    style={styles.newCollCancel}
                    onPress={() => { setNewCollectionMode(false); setNewCollectionName(''); }}
                  >
                    <Text style={styles.newCollCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.newCollCreate, !newCollectionName.trim() && { opacity: 0.4 }]}
                    onPress={handleCreateAndSave}
                    disabled={!newCollectionName.trim()}
                  >
                    <Text style={styles.newCollCreateText}>Create & Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ── Collection list ── */
              <ScrollView bounces={false} style={styles.savePickerList}>
                {/* All Saved */}
                <TouchableOpacity
                  style={styles.savePickerRow}
                  onPress={() => handleSaveToCollection(null)}
                  activeOpacity={0.7}
                >
                  <View style={styles.savePickerIcon}>
                    <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.savePickerRowLabel}>All Saved</Text>
                </TouchableOpacity>

                {/* Existing collections */}
                {pickerCollections.map(col => (
                  <TouchableOpacity
                    key={col.id}
                    style={styles.savePickerRow}
                    onPress={() => handleSaveToCollection(col)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.savePickerIcon}>
                      <Ionicons name="folder-outline" size={18} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.savePickerRowLabel} numberOfLines={1}>{col.name}</Text>
                  </TouchableOpacity>
                ))}

                {/* New collection */}
                <TouchableOpacity
                  style={[styles.savePickerRow, { borderBottomWidth: 0 }]}
                  onPress={() => setNewCollectionMode(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.savePickerIcon}>
                    <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.savePickerRowLabel, { color: colors.primary }]}>New Collection</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={commentsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCommentsVisible(false)}
      >
        <SafeAreaView style={styles.commentsSheet} edges={['top']}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setCommentsVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {commentsLoading ? (
            <ActivityIndicator style={{ padding: 24 }} color={colors.primary} />
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              style={styles.commentsList}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    {item.profiles?.avatar_url ? (
                      <Image source={{ uri: item.profiles.avatar_url }} style={styles.commentAvatarImg} />
                    ) : (
                      <Text style={styles.commentAvatarInitial}>
                        {(item.profiles?.username || '?')[0].toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.commentBody}>
                    <Text style={styles.commentUsername}>@{item.profiles?.username || 'user'}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                  {item.user_id === user?.id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Add a comment..."
                placeholderTextColor={colors.placeholder}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity onPress={handleSubmitComment} disabled={!commentText.trim() || submittingComment}>
                {submittingComment ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="send" size={24} color={commentText.trim() ? colors.primary : "#d1d5db"} />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {
    backgroundColor: c.surface,
    marginBottom: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold'
  },
  authorInfo: {
    justifyContent: 'center'
  },
  authorName: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
    marginBottom: 2
  },
  timeAgo: {
    fontSize: 13,
    color: c.textMuted
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  slide: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: c.borderLight,
    borderRadius: 12,
  },
  imgError: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  photoDotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  title: {
    fontSize: 17,
    fontFamily: 'Figtree_700Bold',
    marginBottom: 8,
    color: c.text
  },
  metadata: {
    marginBottom: 8
  },
  stylistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 6,
  },
  stylistName: {
    fontSize: 13,
    color: c.primary,
    fontFamily: 'Figtree_600SemiBold',
  },
  rating: {
    fontSize: 14,
    color: c.textSecondary
  },
  description: {
    fontSize: 15,
    color: c.text,
    lineHeight: 20
  },
  tagsRow: {
    fontSize: 13,
    color: c.primary,
    fontFamily: 'Figtree_600SemiBold',
    marginTop: 10,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: c.borderLight
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20
  },
  bookmarkButton: {
    marginLeft: 'auto',
    marginRight: 0
  },
  actionText: {
    marginLeft: 6,
    color: c.text,
    fontSize: 15,
    fontFamily: 'Figtree_500Medium'
  },
  // Menu Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: 'flex-end'
  },
  menuContainer: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingTop: 12
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: c.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight
  },
  menuItemText: {
    fontSize: 16,
    color: c.text,
    marginLeft: 16
  },
  menuItemDanger: {
    borderBottomWidth: 0
  },
  menuItemTextDanger: {
    color: '#ef4444'
  },
  cancelButton: {
    justifyContent: 'center',
    marginTop: 8,
    borderTopWidth: 8,
    borderTopColor: c.borderLight,
    borderBottomWidth: 0
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
    textAlign: 'center'
  },
  // Comments Modal
  commentsSheet: {
    flex: 1,
    backgroundColor: c.surface,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  commentsTitle: {
    fontSize: 17,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
  },
  noComments: {
    textAlign: 'center',
    color: c.textMuted,
    padding: 24,
    fontSize: 14,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  commentAvatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  commentAvatarInitial: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: c.textSecondary,
  },
  commentBody: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: c.primary,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: c.text,
    lineHeight: 18,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: c.borderLight,
    gap: 10,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: c.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: c.text,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: c.border,
  },

  // Add-to-collection banner
  savePickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  savePickerSheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
    paddingHorizontal: 20,
    maxHeight: 380,
  },
  savePickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  savePickerTitle: {
    fontSize: 15,
    fontFamily: 'Figtree_700Bold',
    color: c.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  savePickerList: {
    marginTop: 4,
  },
  savePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
    gap: 12,
  },
  savePickerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePickerRowLabel: {
    fontSize: 16,
    fontFamily: 'Figtree_500Medium',
    color: c.text,
    flex: 1,
  },
  newCollForm: {
    marginTop: 8,
    gap: 12,
  },
  newCollInput: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: c.text,
    backgroundColor: c.inputBackground,
  },
  newCollActions: {
    flexDirection: 'row',
    gap: 10,
  },
  newCollCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
  },
  newCollCancelText: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: c.textSecondary,
  },
  newCollCreate: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: c.primary,
    alignItems: 'center',
  },
  newCollCreateText: {
    fontSize: 15,
    fontFamily: 'Figtree_700Bold',
    color: '#fff',
  },
});