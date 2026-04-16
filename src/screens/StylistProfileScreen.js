import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Crown } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND = '#5D1F1F';
const HONEY = '#D4930A';
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 8;
const GRID_SIZE = (SCREEN_WIDTH - GRID_GAP * 3) / 2;

const TABS = ['Posts', 'Services', 'Reviews', 'Tagged'];


export default function StylistProfileScreen({ route, navigation }) {
  const stylist = route?.params?.stylist || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState('Posts');

  const {
    name = 'Stylist',
    location = '',
    rating = 0,
    reviewCount = 0,
    specialties = [],
    photos = [],
  } = stylist;

  const avatarUri = photos[0];

  const AVATAR_SIZE = 90;
  const BANNER_HEIGHT = 120;

  const renderPosts = () => {
    const rows = [];
    for (let i = 0; i < photos.length; i += 2) {
      rows.push(photos.slice(i, i + 2));
    }
    return (
      <View style={styles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((src, i) => (
              <View key={i} style={styles.gridCell}>
                <Image
                  source={typeof src === 'string' ? { uri: src } : src}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Posts':
        return renderPosts();
      case 'Services':
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Services</Text>
            <Text style={styles.emptyText}>Services will appear here</Text>
          </View>
        );
      case 'Reviews':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={36} color={colors.border} />
            <Text style={styles.emptyTitle}>{reviewCount} Reviews</Text>
            <Text style={styles.emptyText}>Reviews will appear here</Text>
          </View>
        );
      case 'Tagged':
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Tagged Posts</Text>
            <Text style={styles.emptyText}>Posts tagging this stylist will appear here</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <LinearGradient
          colors={['#5D1F1F', '#C8835A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: BANNER_HEIGHT }}
        />

        {/* Avatar */}
        <View style={[styles.avatarRow, { marginTop: -(AVATAR_SIZE / 2) }]}>
          <View style={[styles.avatarRing, { width: AVATAR_SIZE + 4, height: AVATAR_SIZE + 4, borderRadius: (AVATAR_SIZE + 4) / 2, backgroundColor: colors.surface }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }} />
            ) : (
              <View style={[styles.avatarPlaceholder, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }]}>
                <Ionicons name="person" size={44} color="#9ca3af" />
              </View>
            )}
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{location}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Crown size={14} color={HONEY} />
            <Text style={styles.metaText}>({reviewCount} reviews)</Text>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{photos.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{reviewCount * 3}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageBtn}>
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>{tab}</Text>
                {active && <View style={styles.activeUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {renderTabContent()}
      </ScrollView>

      {/* Back button overlay */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>

      {/* Social icons overlay */}
      <View style={[styles.socialIcons, { top: insets.top + 8 }]}>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="globe-outline" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="logo-instagram" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  avatarRow: {
    alignItems: 'center',
    zIndex: 1,
  },
  avatarRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 13,
    color: c.textSecondary,
    fontFamily: 'Figtree_400Regular',
  },
  metaDot: {
    fontSize: 13,
    color: c.textSecondary,
    marginHorizontal: 2,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 0,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: c.border,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: c.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: c.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  bookBtn: {
    flex: 1,
    backgroundColor: BRAND,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: '#fff',
  },
  messageBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BRAND,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtnText: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: BRAND,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    color: c.textSecondary,
    fontFamily: 'Figtree_500Medium',
  },
  activeTabText: {
    color: '#111',
    fontFamily: 'Figtree_700Bold',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: HONEY,
  },
  gridContainer: { padding: GRID_GAP },
  gridRow: { flexDirection: 'row', gap: GRID_GAP, marginBottom: GRID_GAP },
  gridCell: { width: GRID_SIZE, height: GRID_SIZE, borderRadius: 10, overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%' },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
  },
  emptyText: {
    fontSize: 14,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  backBtn: {
    position: 'absolute',
    left: 14,
    padding: 6,
    zIndex: 100,
  },
  socialIcons: {
    position: 'absolute',
    right: 14,
    flexDirection: 'row',
    gap: 12,
    zIndex: 100,
  },
});
