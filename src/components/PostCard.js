import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const examplePost = {
    id: '1',
    images: ['placeholder.jpg'], // Now supports multiple images
    title: 'Side Part Silk Press',
    description: 'Book with my stylist she never disappoints!',
    author: 'Laila Hunte',
    timeAgo: '20m ago',
    stylist: 'beautyybyemme',
    rating: 5.0,
    likes: 306,
    comments: 30
  };

  const { 
    title, 
    description, 
    author, 
    timeAgo, 
    stylist, 
    rating, 
    likes, 
    comments, 
    images,
    imageSources // Array of image sources
  } = post || examplePost;

  // Use imageSources if available, otherwise fallback to single imageSource
  const mediaItems = imageSources || (post?.imageSource ? [post.imageSource] : []);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{author}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity>
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

      {/* Content with spacing from image */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.metadata}>
          <Text style={styles.stylist}>
            Stylist: <Text style={styles.stylistName}>@{stylist}</Text>
          </Text>
          {rating && (
            <Text style={styles.rating}>Rating: {rating} stars</Text>
          )}
        </View>

        <Text style={styles.description}>{description}</Text>
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
          <Text style={styles.actionText}>{liked ? likes + 1 : likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#111827" />
          <Text style={styles.actionText}>{comments}</Text>
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
    alignItems: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 12
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
    color: '#3b82f6',
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
  }
});