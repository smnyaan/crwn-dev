import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

// Card used in the masonry explore grid.
// imageHeight lets each card have a different height for the staggered effect.
export default function PostCard({ post, onPress, imageHeight = 180 }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: post.imageUrl }}
        style={[styles.image, { height: imageHeight }]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.author}>by {post.authorName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    backgroundColor: '#F0EDED',
  },
  info: {
    padding: 8,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 2,
  },
  author: {
    fontFamily: 'Figtree-Regular',
    fontSize: 11,
    color: '#7A7A7A',
  },
});
