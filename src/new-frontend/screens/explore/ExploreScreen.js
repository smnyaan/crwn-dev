import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/ui/AppHeader';
import MasonryGrid from '../../components/layout/MasonryGrid';
import PostCard from '../../components/ui/PostCard';
import FAB from '../../components/ui/FAB';

// Alternating heights create the staggered masonry effect.
const IMAGE_HEIGHTS = [220, 160, 180, 240, 200, 170, 210, 190, 230, 175, 195, 215];

// Placeholder posts — replace with real data from Supabase.
const POSTS = [
  { id: '1',  title: 'Twist-out perfection on 4C',        authorName: 'Jasmine Brown',   imageUrl: 'https://images.unsplash.com/photo-1611676930340-33c9b3977e2e?w=400' },
  { id: '2',  title: 'Curls on a sunny day',               authorName: 'Amara Osei',      imageUrl: 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400' },
  { id: '3',  title: 'Box braids with golden accents',     authorName: 'Maya Thompson',   imageUrl: 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=400' },
  { id: '4',  title: 'Natural & free',                     authorName: 'Keisha Williams', imageUrl: 'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=400' },
  { id: '5',  title: 'Two-strand twists with a pop of color 🌸', authorName: 'Jasmine Brown', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400' },
  { id: '6',  title: 'Locs styled in high bun',            authorName: 'Keisha Williams', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400' },
  { id: '7',  title: 'Bantu knots creating beautiful definition', authorName: 'Jasmine Brown', imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400' },
  { id: '8',  title: 'Sleek afro puff for everyday',       authorName: 'Jasmine Brown',   imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400' },
  { id: '9',  title: 'Goddess braids with curly ends',     authorName: 'Jasmine Brown',   imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400' },
  { id: '10', title: 'Perfect wash and go routine',        authorName: 'Marcus Johnson',  imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400' },
  { id: '11', title: 'Fulani braids with beads',           authorName: 'Jasmine Brown',   imageUrl: 'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=400' },
  { id: '12', title: 'Fresh loc retwist',                  authorName: 'Keisha Williams', imageUrl: 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=400' },
];

export default function ExploreScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="logo"
        onSearch={() => {}}
        onMessages={() => navigation.navigate('Messages')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MasonryGrid
          items={POSTS}
          renderItem={({ item, index }) => (
            <PostCard
              key={item.id}
              post={item}
              imageHeight={IMAGE_HEIGHTS[index % IMAGE_HEIGHTS.length]}
              onPress={() => navigation.navigate('PostDetail', { post: item })}
            />
          )}
        />
        <View style={styles.bottomPad} />
      </ScrollView>
      <FAB onPress={() => navigation.navigate('CreatePost')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 10,
  },
  bottomPad: {
    height: 120,
  },
});
