import React, { useState } from 'react';
import {
  ScrollView, View, Text, Image,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import FollowButton from '../../components/ui/FollowButton';
import ActionBar from '../../components/ui/ActionBar';
import CommentRow from '../../components/ui/CommentRow';
import CommentInput from '../../components/ui/CommentInput';
import ProductSheet from '../../components/ui/ProductSheet';
import MasonryGrid from '../../components/layout/MasonryGrid';
import PostCard from '../../components/ui/PostCard';

const PLACEHOLDER_PRODUCTS = [
  { name: 'TRESemme Shampoo',          retailer: 'Available on Amazon', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100' },
  { name: 'Shea Moisture Curl Cream',  retailer: 'Available at Target',  imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=100' },
  { name: 'Cantu Leave-In Conditioner',retailer: 'Available on Amazon', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100' },
];

const PLACEHOLDER_COMMENTS = [
  { id: '1', username: 'NaturalBeauty23', text: 'Absolutely gorgeous! What products did you use?', crownCount: 12, avatarColor: '#C4855A' },
  { id: '2', username: 'CurlyCrown',      text: 'The definition is perfect! 😍',                   crownCount: 8,  avatarColor: '#5D1F1F' },
  { id: '3', username: 'LocLove',         text: 'This is giving me major hair goals!',              crownCount: 15, avatarColor: '#4A7C59' },
];

const MORE_POSTS = [
  { id: 'm1', title: 'Natural curl refresh', authorName: 'Jasmine Brown',   imageUrl: 'https://images.unsplash.com/photo-1611676930340-33c9b3977e2e?w=400' },
  { id: 'm2', title: 'Sitting pretty',        authorName: 'Amara Osei',      imageUrl: 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400' },
  { id: 'm3', title: 'Box braids vibes',      authorName: 'Maya Thompson',   imageUrl: 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=400' },
  { id: 'm4', title: 'Bold & natural',        authorName: 'Keisha Williams', imageUrl: 'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=400' },
];

export default function PostDetailScreen({ navigation, route }) {
  const post = route?.params?.post || {};
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [comments, setComments] = useState(PLACEHOLDER_COMMENTS);
  const [commentsOpen, setCommentsOpen] = useState(false);

  function handlePostComment(text) {
    setComments((c) => [...c, {
      id: Date.now().toString(),
      username: 'you',
      text,
      crownCount: 0,
      avatarColor: '#7A8877',
    }]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button row */}
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Author row */}
        <View style={styles.authorRow}>
          <View style={styles.avatar} />
          <Text style={styles.authorName}>{post.authorName?.replace(' ', '') || 'JasmineBrown'}</Text>
          <FollowButton />
        </View>

        {/* Photo */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: post.imageUrl || 'https://images.unsplash.com/photo-1611676930340-33c9b3977e2e?w=800' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.tagBtn}
            onPress={() => setProductSheetOpen(true)}
            activeOpacity={0.8}
          >
            <Feather name="tag" size={16} color="#5D1F1F" />
          </TouchableOpacity>
        </View>

        {/* Action bar */}
        <ActionBar
          crownCount={342}
          commentCount={comments.length}
          onComment={() => setCommentsOpen((o) => !o)}
          onShare={() => {}}
        />

        {/* Caption + hashtags */}
        <View style={styles.caption}>
          <Text style={styles.captionText}>
            <Text style={styles.captionUsername}>@{post.authorName?.replace(' ', '') || 'JasmineBrown'}</Text>
            {'  '}{post.title || 'Twist-out perfection on 4C hair'}
          </Text>
          <View style={styles.hashtags}>
            <Text style={styles.hashtag}>#4C</Text>
            <Text style={styles.hashtag}>#Twist-Outs</Text>
            <Text style={styles.hashtag}>#Shea Moisture</Text>
          </View>
        </View>

        {/* Comments — hidden until comment icon tapped */}
        {commentsOpen && (
          <View style={styles.comments}>
            {comments.map((c) => (
              <CommentRow key={c.id} {...c} />
            ))}
            <CommentInput onPost={handlePostComment} />
          </View>
        )}

        {/* More like this */}
        <View style={styles.moreSection}>
          <Text style={styles.moreTitle}>More like this</Text>
          <MasonryGrid
            items={MORE_POSTS}
            renderItem={({ item, index }) => (
              <PostCard
                key={item.id}
                post={item}
                imageHeight={index % 2 === 0 ? 160 : 140}
                onPress={() => navigation.push('PostDetail', { post: item })}
              />
            )}
          />
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      <ProductSheet
        visible={productSheetOpen}
        products={PLACEHOLDER_PRODUCTS}
        onClose={() => setProductSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F2EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4C8B8',
  },
  authorName: {
    flex: 1,
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#1A1A1A',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 380,
    backgroundColor: '#F0EDED',
  },
  tagBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  caption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  captionUsername: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#5D1F1F',
  },
  captionText: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  hashtags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  hashtag: {
    fontFamily: 'Figtree-Medium',
    fontSize: 13,
    color: '#5D1F1F',
  },
  comments: {
    paddingHorizontal: 16,
  },
  moreSection: {
    paddingTop: 24,
  },
  moreTitle: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 18,
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  bottomPad: {
    height: 40,
  },
});
