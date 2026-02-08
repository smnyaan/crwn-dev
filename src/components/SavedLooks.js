import React, { useState, useEffect } from 'react';
import { 
  View, 
  Image, 
  FlatList, 
  Dimensions, 
  StyleSheet, 
  Text, 
  ActivityIndicator,
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const tileSize = screenWidth / numColumns;

export default function SavedLooks({ headerComponent }) {
  const { user } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBookmarkedPosts();
  }, [user]);

  useEffect(() => {
    filterPostsByCategory();
  }, [activeCategory, bookmarkedPosts]);

  const fetchBookmarkedPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await postService.getBookmarkedPosts(user.id);
    
    if (error) {
      console.error('Error fetching bookmarks:', error);
    } else {
      // Extract posts from bookmarks
      const posts = data?.map(bookmark => bookmark.posts).filter(Boolean) || [];
      setBookmarkedPosts(posts);
      
      // Extract unique categories from posts
      const uniqueCategories = [...new Set(
        posts
          .filter(post => post.category)
          .map(post => post.category)
      )];
      
      setCategories(['all', ...uniqueCategories]);
    }
    setLoading(false);
  };

  const filterPostsByCategory = () => {
    if (activeCategory === 'all') {
      setFilteredPosts(bookmarkedPosts);
    } else {
      const filtered = bookmarkedPosts.filter(
        post => post.category === activeCategory
      );
      setFilteredPosts(filtered);
    }
  };

  const getCategoryLabel = (category) => {
    if (category === 'all') return 'All Posts';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const renderCategoryFilters = () => {
    if (categories.length <= 1) return null;

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                isActive && styles.categoryButtonActive
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                isActive && styles.categoryTextActive
              ]}>
                {getCategoryLabel(category)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderItem = ({ item }) => {
    // Get first image from post
    const firstImage = item.post_media?.[0]?.media_url;

    return (
      <View style={styles.tile}>
        {firstImage ? (
          <Image 
            source={{ uri: firstImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="image-outline" size={32} color="#9ca3af" />
          </View>
        )}
        
        {/* Category badge on image */}
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {getCategoryLabel(item.category)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D1F1F" />
      </View>
    );
  }

  if (bookmarkedPosts.length === 0) {
    return (
      <View style={styles.emptyStateFullScreen}>
        <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No saved posts yet</Text>
        <Text style={styles.emptyText}>
          Tap the bookmark icon on posts you want to save for later
        </Text>
      </View>
    );
  }

  // Render empty state for filtered category
  const renderEmptyCategory = () => (
    <View style={styles.emptyState}>
      <Ionicons name="file-tray-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No posts in this category</Text>
      <Text style={styles.emptyText}>
        Try selecting a different category
      </Text>
    </View>
  );

  return (
    <FlatList
      data={filteredPosts}
      renderItem={renderItem}
      numColumns={numColumns}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <>
          {headerComponent}
          {renderCategoryFilters()}
        </>
      }
      ListEmptyComponent={renderEmptyCategory}
      contentContainerStyle={filteredPosts.length === 0 ? styles.emptyContentContainer : styles.gridContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#5D1F1F',
    borderColor: '#5D1F1F',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  gridContent: {
    paddingBottom: 16,
  },
  tile: {
    width: tileSize,
    height: tileSize,
    padding: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  placeholder: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 100,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});