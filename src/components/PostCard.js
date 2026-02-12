import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Share,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PostCard({ 
  post, 
  currentUserId,
  onDelete,
  onUpdate,
  onNavigateToProfile,
  onNavigateToStylist
}) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

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
    user_id
  } = currentPost;

  // Get author info from profiles relation
  const authorName = profiles?.full_name || profiles?.username || 'Anonymous';
  const authorUsername = profiles?.username || 'user';
  const authorAvatar = profiles?.avatar_url;
  const authorId = profiles?.id || user_id;

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

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentIndex(index);
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

  const handleEdit = () => {
    setMenuVisible(false);
    setEditTitle(title || '');
    setEditDescription(description || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (onUpdate) {
      const result = await onUpdate(postId, currentUserId, {
        title: editTitle,
        description: editDescription
      });
      if (result?.success) {
        setEditModalVisible(false);
        Alert.alert('Success', 'Post updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update post');
      }
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

      {/* Post Images/Videos Carousel */}
      {mediaItems.length > 0 && (
        <View style={styles.mediaContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {mediaItems.map((item, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={item}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          {mediaItems.length > 1 && (
            <View style={styles.pagination}>
              {mediaItems.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.paginationDotActive
                  ]}
                />
              ))}
            </View>
          )}

          {/* Media Counter */}
          {mediaItems.length > 1 && (
            <View style={styles.mediaCounter}>
              <Text style={styles.mediaCounterText}>
                {currentIndex + 1}/{mediaItems.length}
              </Text>
            </View>
          )}
        </View>
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
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setLiked(!liked)}
        >
          <Ionicons 
            name={liked ? "heart" : "heart-outline"} 
            size={24} 
            color={liked ? "#ef4444" : "#111827"} 
          />
          <Text style={styles.actionText}>{liked ? (likes_count || 0) + 1 : (likes_count || 0)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#111827" />
          <Text style={styles.actionText}>{comments_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.bookmarkButton]}
          onPress={() => setBookmarked(!bookmarked)}
        >
          <Ionicons 
            name={bookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color="#111827"
          />
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
                {/* Edit Option - Only for own posts */}
                <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                  <Ionicons name="create-outline" size={24} color="#111827" />
                  <Text style={styles.menuItemText}>Edit Post</Text>
                </TouchableOpacity>

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

      {/* Edit Post Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.editModalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.editModalTitle}>Edit Post</Text>
              <TouchableOpacity onPress={handleSaveEdit}>
                <Text style={styles.editModalSave}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Title</Text>
              <TextInput
                style={styles.editInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Post title"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.editLabel}>Description</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Post description"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
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
    position: 'relative'
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 400
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6'
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    gap: 6
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  paginationDotActive: {
    backgroundColor: '#fff'
  },
  mediaCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  mediaCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
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
  // Edit Modal Styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  editModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%'
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  editModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827'
  },
  editModalCancel: {
    fontSize: 16,
    color: '#6b7280'
  },
  editModalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D1F1F'
  },
  editForm: {
    padding: 16
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
    backgroundColor: '#f9fafb'
  },
  editTextArea: {
    minHeight: 120,
    paddingTop: 12
  }
});