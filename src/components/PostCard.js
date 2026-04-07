import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
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
import { postService } from '../services/postService';


export default function PostCard({ 
  post,
  currentUserId,
  onDelete,
  onNavigateToProfile,
  onNavigateToStylist
}) {
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const fadeTimer = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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
  const authorAvatar = authorId === user?.id ? (currentUserProfile?.avatar_url ?? profiles?.avatar_url) : profiles?.avatar_url;

  // Get stylist info
  const stylistUsername = stylists?.username;
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
    } else {
      setBookmarked(true);
      await postService.bookmarkPost(user.id, postId);
    }
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
    Alert.alert('Delete Comment', 'Delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const { error } = await postService.deleteComment(commentId, user.id);
          if (!error) setComments(prev => prev.filter(c => c.id !== commentId));
        }
      }
    ]);
  };

  const showControls = () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    Animated.timing(controlsOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    fadeTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }, 2000);
  };

  const handlePrev = () => {
    setCurrentIndex(i => Math.max(0, i - 1));
    showControls();
  };

  const handleNext = () => {
    setCurrentIndex(i => Math.min(mediaItems.length - 1, i + 1));
    showControls();
  };

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


  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (onDelete) {
              const result = await onDelete(postId, currentUserId);
              if (!result?.success) {
                Alert.alert('Error', 'Failed to delete post');
              }
            }
          }
        }
      ]
    );
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
          <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Post Images Carousel */}
      {mediaItems.length > 0 && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={showControls}
          style={styles.mediaContainer}
        >
          <Image
            source={mediaItems[currentIndex]}
            style={styles.image}
            resizeMode="cover"
          />

          {mediaItems.length > 1 && (
            <Animated.View style={[styles.carouselControls, { opacity: controlsOpacity }]}>
              {/* Left arrow */}
              <TouchableOpacity
                style={[styles.arrowBtn, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
                onPress={handlePrev}
                disabled={currentIndex === 0}
              >
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </TouchableOpacity>

              {/* Counter */}
              <View style={styles.mediaCounter}>
                <Text style={styles.mediaCounterText}>
                  {currentIndex + 1}/{mediaItems.length}
                </Text>
              </View>

              {/* Right arrow */}
              <TouchableOpacity
                style={[styles.arrowBtn, { opacity: currentIndex === mediaItems.length - 1 ? 0.3 : 1 }]}
                onPress={handleNext}
                disabled={currentIndex === mediaItems.length - 1}
              >
                <Ionicons name="chevron-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.metadata}>
          {stylistUsername && (
            <TouchableOpacity onPress={handleStylistPress}>
              <Text style={styles.stylist}>
                Stylist: <Text style={styles.stylistName}>@{stylistUsername}</Text>
              </Text>
            </TouchableOpacity>
          )}
          {rating && (
            <Text style={styles.rating}>Rating: {rating} stars</Text>
          )}
        </View>

        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? "#ef4444" : "#111827"} />
          <Text style={styles.actionText}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
          <Ionicons name="chatbubble-outline" size={24} color="#111827" />
          <Text style={styles.actionText}>{comments.length || dbCommentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.bookmarkButton]} onPress={handleBookmark}>
          <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={bookmarked ? "#5D1F1F" : "#111827"} />
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
              <Ionicons name="share-outline" size={24} color="#111827" />
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
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {commentsLoading ? (
            <ActivityIndicator style={{ padding: 24 }} color="#5D1F1F" />
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
                      <Ionicons name="trash-outline" size={18} color="#9ca3af" />
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
                placeholderTextColor="#9ca3af"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity onPress={handleSubmitComment} disabled={!commentText.trim() || submittingComment}>
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#5D1F1F" />
                ) : (
                  <Ionicons name="send" size={24} color={commentText.trim() ? "#5D1F1F" : "#d1d5db"} />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
    backgroundColor: '#5D1F1F',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  authorInfo: {
    justifyContent: 'center'
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2
  },
  timeAgo: {
    fontSize: 13,
    color: '#9ca3af'
  },
  mediaContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
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
  mediaCounter: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827'
  },
  metadata: {
    marginBottom: 8
  },
  stylist: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  stylistName: {
    color: '#5D1F1F',
    fontWeight: '500'
  },
  rating: {
    fontSize: 14,
    color: '#6b7280'
  },
  description: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
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
    color: '#111827',
    fontSize: 15,
    fontWeight: '500'
  },
  // Menu Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingTop: 12
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
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
    borderBottomColor: '#f3f4f6'
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
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
    borderTopColor: '#f3f4f6',
    borderBottomWidth: 0
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center'
  },
  // Comments Modal
  commentsSheet: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  noComments: {
    textAlign: 'center',
    color: '#9ca3af',
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
    backgroundColor: '#e5e7eb',
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
    fontWeight: '600',
    color: '#6b7280',
  },
  commentBody: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D1F1F',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 18,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 10,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    maxHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});