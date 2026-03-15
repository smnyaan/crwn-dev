import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import AppHeader from '../../components/ui/AppHeader';
import FilterChips from '../../components/ui/FilterChips';
import StylistCard from '../../components/ui/StylistCard';

const FILTERS = ['All', 'Braids', 'Locs', 'Twists', 'Color', 'Natural'];

const STYLISTS = [
  {
    id: '1',
    name: 'Jasmine Brown',
    location: 'Brooklyn, NY',
    rating: 4.9,
    reviewCount: 127,
    specialties: ['Braids', 'Protective Styles', 'Natural Hair'],
    photos: [
      'https://images.unsplash.com/photo-1611676930340-33c9b3977e2e?w=300',
      'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=300',
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=300',
    ],
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    location: 'Atlanta, GA',
    rating: 4.8,
    reviewCount: 89,
    specialties: ['Fades', 'Natural Hair', 'Locs'],
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
    ],
  },
  {
    id: '3',
    name: 'Maya Thompson',
    location: 'Los Angeles, CA',
    rating: 5,
    reviewCount: 203,
    specialties: ['Color', 'Silk Press', 'Treatments'],
    photos: [
      'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=300',
      'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=300',
      'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=300',
    ],
  },
  {
    id: '4',
    name: 'Keisha Williams',
    location: 'Houston, TX',
    rating: 4.7,
    reviewCount: 156,
    specialties: ['Locs', 'Twists', 'Braids'],
    photos: [
      'https://images.unsplash.com/photo-1611676930340-33c9b3977e2e?w=300',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
    ],
  },
];

export default function StylistsScreen({ navigation }) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader
        variant="logo"
        onSearch={() => {}}
        onMessages={() => {}}
      />

      {/* Filter row */}
      <View style={styles.filterRow}>
        <View style={styles.searchIconWrap}>
          <Feather name="search" size={18} color="#5E5E5E" />
        </View>
        <FilterChips options={FILTERS} />
      </View>

      {/* Stylist list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {STYLISTS.map((stylist) => (
          <StylistCard
            key={stylist.id}
            stylist={stylist}
            onPress={() => navigation.navigate('StylistProfile', { stylist })}
          />
        ))}
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconWrap: {
    paddingHorizontal: 16,
  },
  scroll: {
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
