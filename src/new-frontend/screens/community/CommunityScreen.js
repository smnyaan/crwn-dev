import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AppHeader from '../../components/ui/AppHeader';
import FilterChips from '../../components/ui/FilterChips';
import ThreadCard from '../../components/ui/ThreadCard';
import FAB from '../../components/ui/FAB';

const FILTERS = ['All', 'Low Porosity', 'High Porosity', 'Protective Styles', 'Styling Tips'];

const THREADS = [
  {
    id: '1',
    tag: 'Low Porosity',
    title: 'Best leave-in conditioners for low porosity hair?',
    body: "I've been struggling to find a good leave-in that doesn't just sit on my hair. Low porosity 3B here.",
    crownCount: 89,
    commentCount: 42,
    timeAgo: '2 days ago',
  },
  {
    id: '2',
    tag: 'Protective Styles',
    title: 'How long do you keep in protective styles?',
    body: "I usually keep my box braids in for 6-8 weeks. Is that too long? How do you all balance",
    crownCount: 134,
    commentCount: 67,
    timeAgo: '1 day ago',
  },
  {
    id: '3',
    tag: 'Styling Tips',
    title: 'Silk press without heat damage - is it possible?',
    body: "I want to try a silk press for a special event but I'm terrified of heat damage. What precautions should",
    crownCount: 245,
    commentCount: 103,
    timeAgo: '3 days ago',
  },
  {
    id: '4',
    tag: 'Beginner Advice',
    title: 'Starting my natural hair journey - need help',
    body: "Where do I even start with products and",
    crownCount: 312,
    commentCount: 156,
    timeAgo: '5 days ago',
  },
  {
    id: '5',
    tag: 'Hair Growth',
    title: 'Rice water for hair growth - does it actually work?',
    body: "I've been seeing rice water everywhere. Has anyone had actual results with hair",
    crownCount: 178,
    commentCount: 89,
    timeAgo: '4 days ago',
  },
];

export default function CommunityScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredThreads =
    selectedFilter === 'All'
      ? THREADS
      : THREADS.filter((t) => t.tag === selectedFilter);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <AppHeader
        variant="logo"
        onSearch={() => {}}
        onMessages={() => navigation.navigate('Messages')}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.searchIcon} activeOpacity={0.7}>
          <Feather name="search" size={18} color="#1A1A1A" />
        </TouchableOpacity>
        <FilterChips
          options={FILTERS}
          onSelect={(opt) => setSelectedFilter(opt)}
          style={styles.filterChips}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredThreads.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            onPress={() => navigation.navigate('ThreadDetail', { thread })}
          />
        ))}
        <View style={styles.bottomPad} />
      </ScrollView>

      <FAB onPress={() => navigation.navigate('CreateThread')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    padding: 4,
    marginLeft: 12,
  },
  filterChips: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bottomPad: {
    height: 120,
  },
});
