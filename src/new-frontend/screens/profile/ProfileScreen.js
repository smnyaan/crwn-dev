import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import BookingCard from '../../components/ui/BookingCard';
import HairStatCard from '../../components/ui/HairStatCard';

const POSTS_GRID = [
  'https://images.unsplash.com/photo-1611676930340-33c9b3977e2e?w=300',
  'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=300',
  'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=300',
  'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=300',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
];

const BOOKINGS = [
  { id: '1', stylistName: 'Jasmine Brown', service: 'Box Braids', date: 'Mar 20, 2026', status: 'Upcoming' },
  { id: '2', stylistName: 'Maya Thompson', service: 'Silk Press', date: 'Feb 10, 2026', status: 'Completed' },
];

const HAIR_STATS = [
  { label: 'Hair Type', value: '4A' },
  { label: 'Porosity', value: 'Low' },
  { label: 'Density', value: 'Medium' },
  { label: 'Texture', value: 'Coily' },
];

const TABS = ['Posts', 'Bookings', 'Hair'];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Posts');

  const renderPostsGrid = () => {
    const rows = [];
    for (let i = 0; i < POSTS_GRID.length; i += 3) {
      const rowItems = POSTS_GRID.slice(i, i + 3);
      rows.push(
        <View key={i} style={styles.gridRow}>
          {rowItems.map((uri, idx) => (
            <View key={idx} style={styles.gridImageWrapper}>
              <Image source={{ uri }} style={styles.gridImage} />
            </View>
          ))}
          {rowItems.length < 3 &&
            Array(3 - rowItems.length)
              .fill(null)
              .map((_, idx) => (
                <View key={`empty-${idx}`} style={styles.gridImageWrapper} />
              ))}
        </View>
      );
    }
    return rows;
  };

  const renderTabContent = () => {
    if (activeTab === 'Posts') {
      return <View>{renderPostsGrid()}</View>;
    }

    if (activeTab === 'Bookings') {
      return (
        <View>
          {BOOKINGS.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </View>
      );
    }

    if (activeTab === 'Hair') {
      const statRows = [
        HAIR_STATS.slice(0, 2),
        HAIR_STATS.slice(2, 4),
      ];

      return (
        <View>
          {/* Privacy banner */}
          <View style={styles.privacyBanner}>
            <Feather name="lock" size={14} color="#E07B00" />
            <Text style={styles.privacyText}>Private - Shared with stylists only</Text>
          </View>

          {/* 2x2 stat grid */}
          {statRows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.statRow}>
              {row.map((stat, idx) => (
                <HairStatCard key={idx} label={stat.label} value={stat.value} />
              ))}
            </View>
          ))}

          {/* Current Goals */}
          <View style={styles.goalsSection}>
            <Text style={styles.goalsTitle}>Current Goals</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <LinearGradient
          colors={['#6B2D0A', '#C4785A', '#E8C4A8']}
          style={styles.gradientHeader}
        >
          <TouchableOpacity style={styles.settingsButton}>
            <Feather name="settings" size={22} color="white" />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: POSTS_GRID[0] }} style={styles.avatarImage} />
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Alana Stull</Text>
          <Text style={styles.profileUsername}>@alanastull</Text>
          <Text style={styles.profileBio}>
            Natural hair enthusiast. 4A coils & proud. Sharing my journey one style at a time.
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>234</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>189</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Buttons row */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Feather name="share-2" size={14} color="#1A1A1A" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                  {tab === 'Hair' ? (
                    tab
                  ) : (
                    tab
                  )}
                  {tab === 'Hair' && (
                    <Text> </Text>
                  )}
                </Text>
                {tab === 'Hair' && (
                  <Feather
                    name="lock"
                    size={12}
                    color={isActive ? '#1A1A1A' : '#ABABAB'}
                    style={styles.lockIcon}
                  />
                )}
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>{renderTabContent()}</View>

        {/* Bottom padding */}
        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  gradientHeader: {
    height: 160,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 56,
    right: 16,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D4C8B8',
    position: 'absolute',
    bottom: -45,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -45,
    borderWidth: 3,
    borderColor: 'white',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 90,
    height: 90,
  },
  profileInfo: {
    backgroundColor: 'white',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  profileName: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 22,
    color: '#1A1A1A',
  },
  profileUsername: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#5E5E5E',
    marginTop: 2,
  },
  profileBio: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#5E5E5E',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 20,
    color: '#1A1A1A',
  },
  statLabel: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#5E5E5E',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  editButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D4C8B8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#1A1A1A',
  },
  shareButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D4C8B8',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareButtonText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#1A1A1A',
  },
  tabBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDED',
    marginTop: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 15,
  },
  tabTextActive: {
    fontFamily: 'Figtree-SemiBold',
    color: '#1A1A1A',
  },
  tabTextInactive: {
    fontFamily: 'Figtree-Regular',
    color: '#ABABAB',
  },
  lockIcon: {
    marginLeft: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2.5,
    width: '60%',
    backgroundColor: '#F5A42A',
    borderRadius: 2,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridImageWrapper: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#F0EDED',
    margin: 1,
  },
  gridImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  privacyBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  privacyText: {
    fontFamily: 'Figtree-Medium',
    fontSize: 13,
    color: '#E07B00',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  goalsSection: {
    marginTop: 8,
  },
  goalsTitle: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  bottomPad: {
    height: 120,
  },
});
