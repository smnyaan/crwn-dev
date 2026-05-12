import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { s, SCREEN_HEIGHT } from '../utils/responsive';
import { Ionicons as Icon } from '@expo/vector-icons';
import SavedLooks from './SavedLooks';
import HairProfile from './HairProfile';
import PostCard from './PostCard';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { bookingService } from '../services/bookingService';
import { postService } from '../services/postService';
import { supabase } from '../config/supabase';

// ── Scrapbook layout (mirrors ExploreScreen) ─────────────────────────────────
const SIDE_PAD = 12;
const GAP = 12;

const H = {
  feature:  [s(340), s(310), s(360), s(325), s(350)],
  full:     [s(255), s(230), s(275), s(245), s(260)],
  banner:   [s(145), s(160), s(135), s(155), s(148)],
  pair:     [s(195), s(215), s(180), s(225), s(205)],
  trio:     [s(158), s(172), s(148), s(182), s(163)],
  tall:     [s(235), s(255), s(218), s(245), s(228)],
  stacked:  [s(118), s(108), s(125), s(112), s(120)],
  quad:     [s(148), s(135), s(158), s(143), s(152)],
};

const nth = (arr, i) => arr[i % arr.length];

const PATTERN = [
  'full', 'pair', 'wide-thin', 'trio', 'feature', 'stacked-right',
  'large-small', 'quad', 'banner', 'thin-wide', 'trio', 'stacked-left',
  'pair', 'feature', 'wide-thin', 'full', 'stacked-right', 'small-large',
  'trio', 'banner', 'quad', 'large-small', 'stacked-left', 'full',
  'pair', 'thin-wide', 'feature', 'trio',
];

const NEEDS = {
  feature: 1, full: 1, banner: 1,
  pair: 2, 'large-small': 2, 'small-large': 2, 'wide-thin': 2, 'thin-wide': 2,
  trio: 3, 'stacked-right': 3, 'stacked-left': 3,
  quad: 4,
};

function buildRows(posts) {
  const rows = [];
  let i = 0, pi = 0;
  while (i < posts.length) {
    const remaining = posts.length - i;
    let type = PATTERN[pi % PATTERN.length];
    pi++;
    const need = NEEDS[type];
    if (remaining < need) {
      if (remaining >= 3) type = 'trio';
      else if (remaining >= 2) type = 'pair';
      else type = 'full';
    }
    rows.push({ type, posts: posts.slice(i, i + NEEDS[type]), startIndex: i });
    i += NEEDS[type];
  }
  return rows;
}

const ALL_TABS = [
  { key: 'posts',     label: 'Posts' },
  { key: 'tagged',    label: 'Tagged',   stylistOnly: true },
  { key: 'favorites', label: 'Saved',    ownOnly: true },
  { key: 'bookings',  label: 'Bookings', ownOnly: true },
  { key: 'hair',      label: 'Hair',     lock: true },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ProfileTabs({ viewedUserId, isOwnProfile }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [isViewedStylist, setIsViewedStylist] = useState(false);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [taggedLoading, setTaggedLoading] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { profile: authProfile } = useAuth();
  const isOwnStylist = isOwnProfile && !!authProfile?.is_stylist;
  const { posts, loading, refresh, deletePost } = usePosts(viewedUserId);

  // ── Scrapbook tile renderers ────────────────────────────────────────────────
  const renderTileInner = (item, height) => {
    const firstImage = item.post_media?.[0]?.media_url;
    const stylistName = item.stylists?.full_name || item.stylists?.username;
    return (
      <TouchableOpacity onPress={() => setSelectedPost(item)} activeOpacity={0.88}>
        <View style={[styles.tileImage, { height }]}>
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.tileImagePlaceholder} />
          )}
          {(item.post_media?.length ?? 0) > 1 && (
            <View style={styles.photoDots}>
              {Array.from({ length: Math.min(item.post_media.length, 5) }).map((_, i) => (
                <View key={i} style={[styles.photoDot, i === 0 && styles.photoDotActive]} />
              ))}
            </View>
          )}
        </View>
        {stylistName ? (
          <View style={styles.tileFooter}>
            <View style={styles.tileFooterRow}>
              <Icon name="cut-outline" size={10} color={colors.primary} />
              <Text style={styles.tileFooterStylist} numberOfLines={1}>{stylistName}</Text>
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderRow = (row) => {
    const { type, posts: rPosts, startIndex: si } = row;
    switch (type) {
      case 'feature':
        return <View key={rPosts[0].id} style={styles.tileShadow}>{renderTileInner(rPosts[0], nth(H.feature, si))}</View>;
      case 'full':
        return <View key={rPosts[0].id} style={styles.tileShadow}>{renderTileInner(rPosts[0], nth(H.full, si))}</View>;
      case 'banner':
        return <View key={rPosts[0].id} style={styles.tileShadow}>{renderTileInner(rPosts[0], nth(H.banner, si))}</View>;
      case 'pair':
        return (
          <View key={`row-${si}`} style={styles.row}>
            <View style={[styles.flex1, styles.tileShadow]}>{renderTileInner(rPosts[0], nth(H.pair, si))}</View>
            <View style={[styles.flex1, styles.tileShadow]}>{renderTileInner(rPosts[1], nth(H.pair, si + 1))}</View>
          </View>
        );
      case 'trio':
        return (
          <View key={`row-${si}`} style={styles.row}>
            {rPosts.map((item, i) => (
              <View key={item.id} style={[styles.flex1, styles.tileShadow]}>{renderTileInner(item, nth(H.trio, si + i))}</View>
            ))}
          </View>
        );
      case 'large-small':
        return (
          <View key={`row-${si}`} style={styles.row}>
            <View style={[{ flex: 3 }, styles.tileShadow]}>{renderTileInner(rPosts[0], nth(H.tall, si))}</View>
            <View style={[{ flex: 2 }, styles.tileShadow]}>{renderTileInner(rPosts[1], nth(H.tall, si))}</View>
          </View>
        );
      case 'small-large':
        return (
          <View key={`row-${si}`} style={styles.row}>
            <View style={[{ flex: 2 }, styles.tileShadow]}>{renderTileInner(rPosts[0], nth(H.tall, si))}</View>
            <View style={[{ flex: 3 }, styles.tileShadow]}>{renderTileInner(rPosts[1], nth(H.tall, si))}</View>
          </View>
        );
      case 'wide-thin':
        return (
          <View key={`row-${si}`} style={styles.row}>
            <View style={[{ flex: 4 }, styles.tileShadow]}>{renderTileInner(rPosts[0], nth(H.tall, si))}</View>
            <View style={[{ flex: 2 }, styles.tileShadow]}>{renderTileInner(rPosts[1], nth(H.tall, si))}</View>
          </View>
        );
      case 'thin-wide':
        return (
          <View key={`row-${si}`} style={styles.row}>
            <View style={[{ flex: 2 }, styles.tileShadow]}>{renderTileInner(rPosts[0], nth(H.tall, si))}</View>
            <View style={[{ flex: 4 }, styles.tileShadow]}>{renderTileInner(rPosts[1], nth(H.tall, si))}</View>
          </View>
        );
      case 'stacked-right': {
        const sh = nth(H.stacked, si);
        const totalH = sh * 2 + GAP;
        return (
          <View key={`row-${si}`} style={styles.row}>
            <View style={[styles.flex1, styles.tileShadow]}>{renderTileInner(rPosts[0], totalH)}</View>
            <View style={[styles.flex1, { gap: GAP }]}>
              <View style={styles.tileShadow}>{renderTileInner(rPosts[1], sh)}</View>
              <View style={styles.tileShadow}>{renderTileInner(rPosts[2], sh)}</View>
            </View>
          </View>
        );
      }
      case 'stacked-left': {
        const sh = nth(H.stacked, si);
        const totalH = sh * 2 + GAP;
        return (
          <View key={`row-${si}`} style={styles.row}>
            <View style={[styles.flex1, { gap: GAP }]}>
              <View style={styles.tileShadow}>{renderTileInner(rPosts[0], sh)}</View>
              <View style={styles.tileShadow}>{renderTileInner(rPosts[1], sh)}</View>
            </View>
            <View style={[styles.flex1, styles.tileShadow]}>{renderTileInner(rPosts[2], totalH)}</View>
          </View>
        );
      }
      case 'quad': {
        const qh = nth(H.quad, si);
        return (
          <View key={`row-${si}`} style={{ gap: GAP }}>
            <View style={styles.row}>
              <View style={[styles.flex1, styles.tileShadow]}>{renderTileInner(rPosts[0], qh)}</View>
              <View style={[styles.flex1, styles.tileShadow]}>{renderTileInner(rPosts[1], qh)}</View>
            </View>
            <View style={styles.row}>
              <View style={[styles.flex1, styles.tileShadow]}>{renderTileInner(rPosts[2], qh)}</View>
              <View style={[styles.flex1, styles.tileShadow]}>{renderTileInner(rPosts[3], qh)}</View>
            </View>
          </View>
        );
      }
      default: return null;
    }
  };

  // Check if viewed profile is a stylist
  useEffect(() => {
    if (!viewedUserId) return;
    supabase
      .from('profiles')
      .select('is_stylist')
      .eq('id', viewedUserId)
      .single()
      .then(({ data }) => setIsViewedStylist(!!data?.is_stylist));
  }, [viewedUserId]);

  // Load tagged posts when that tab is opened
  useEffect(() => {
    if (activeTab === 'tagged' && isViewedStylist && viewedUserId) {
      setTaggedLoading(true);
      postService.getTaggedPosts(viewedUserId).then(({ data }) => {
        setTaggedPosts(data || []);
        setTaggedLoading(false);
      });
    }
  }, [activeTab, isViewedStylist, viewedUserId]);

  useEffect(() => {
    if (activeTab === 'bookings' && isOwnProfile && user?.id) {
      setBookingsLoading(true);
      const fetch = isOwnStylist
        ? bookingService.getBookingsByStylist(user.id)
        : bookingService.getBookingsByUser(user.id);
      fetch.then(({ data }) => {
        setBookings(data || []);
        setBookingsLoading(false);
      });
    }
  }, [activeTab, isOwnProfile, isOwnStylist, user?.id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        if (loading) {
          return <ActivityIndicator style={{ paddingTop: 60 }} size="large" color={colors.primary} />;
        }
        if (posts.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                {isOwnProfile ? 'Share your first hairstyle!' : "This user hasn't posted yet."}
              </Text>
            </View>
          );
        }
        return (
          <View style={styles.grid}>
            {buildRows(posts).map(renderRow)}
          </View>
        );

      case 'tagged':
        if (taggedLoading) {
          return <ActivityIndicator style={{ paddingTop: 60 }} size="large" color={colors.primary} />;
        }
        if (taggedPosts.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tagged posts yet</Text>
              <Text style={styles.emptyText}>Posts where this stylist is tagged will appear here</Text>
            </View>
          );
        }
        return (
          <View style={styles.grid}>
            {buildRows(taggedPosts).map(renderRow)}
          </View>
        );

      case 'favorites':
        return <SavedLooks />;

      case 'bookings':
        if (!isOwnProfile) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Private</Text>
              <Text style={styles.emptyText}>Bookings are only visible to the owner</Text>
            </View>
          );
        }
        if (bookingsLoading) {
          return <ActivityIndicator style={{ paddingTop: 60 }} size="large" color={colors.primary} />;
        }
        if (bookings.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>
                {isOwnStylist ? 'Client bookings will appear here' : 'Your appointments will appear here'}
              </Text>
            </View>
          );
        }
        return (
          <View style={styles.bookingsList}>
            {bookings.map((booking) => {
              const isUpcoming = booking.status === 'upcoming';
              const isCancelled = booking.status === 'cancelled';
              const displayName = isOwnStylist
                ? (booking.client?.full_name || booking.client?.username || 'Client')
                : (booking.stylists?.full_name || booking.stylists?.business_name || booking.stylists?.username || 'Unknown Stylist');
              const badgeStyle = isUpcoming
                ? styles.statusUpcoming
                : isCancelled
                  ? styles.statusCancelled
                  : styles.statusCompleted;
              const badgeTextStyle = isUpcoming
                ? styles.statusUpcomingText
                : isCancelled
                  ? styles.statusCancelledText
                  : styles.statusCompletedText;
              return (
                <View key={booking.id} style={styles.bookingCard}>
                  <View style={styles.bookingRow}>
                    <Text style={styles.bookingStylist}>{displayName}</Text>
                    <View style={[styles.statusBadge, badgeStyle]}>
                      <Text style={[styles.statusText, badgeTextStyle]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.bookingService}>{booking.service_name}</Text>
                  <Text style={styles.bookingDate}>{formatDate(booking.appointment_date)}</Text>
                </View>
              );
            })}
          </View>
        );

      case 'hair':
        if (!isOwnProfile) {
          return (
            <View style={styles.emptyState}>
              <Icon name="lock-closed-outline" size={40} color="#d1d5db" />
              <Text style={styles.emptyTitle}>Private</Text>
              <Text style={styles.emptyText}>Hair profile is only visible to the owner</Text>
            </View>
          );
        }
        return <HairProfile viewedUserId={viewedUserId} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {ALL_TABS.filter((tab) => {
          if (tab.ownOnly && !isOwnProfile) return false;
          if (tab.stylistOnly && !isViewedStylist) return false;
          return true;
        }).map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.tabLabelRow}>
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tab.label}
                </Text>
                {tab.lock && (
                  <Icon name="lock-closed" size={12} color={active ? colors.selected : '#9ca3af'} style={{ marginLeft: 3 }} />
                )}
              </View>
              {active && <View style={styles.activeUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>{renderContent()}</View>

      {/* Post detail popup */}
      <Modal
        visible={!!selectedPost}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPost(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelectedPost(null)}>
          <Pressable style={[styles.popupCard, Platform.OS === 'web' && styles.popupCardWeb]} onPress={() => {}}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <PostCard
                post={selectedPost}
                currentUserId={user?.id}
                onDelete={async (postId, userId) => {
                  const result = await deletePost(postId, userId);
                  if (result?.success) setSelectedPost(null);
                  return result;
                }}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {},
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
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    color: c.textSecondary,
    fontFamily: 'Figtree_500Medium',
  },
  activeTabText: {
    color: c.selected,
    fontFamily: 'Figtree_700Bold',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: c.selected,
  },
  content: {},

  // Scrapbook grid
  grid: {
    paddingHorizontal: SIDE_PAD,
    paddingTop: 12,
    paddingBottom: 40,
    gap: GAP,
  },
  row: { flexDirection: 'row', gap: GAP },
  flex1: { flex: 1 },
  tileShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tileImage: {
    width: '100%',
    borderRadius: 5.5,
    overflow: 'hidden',
    backgroundColor: c.borderLight,
  },
  tileImagePlaceholder: { flex: 1, backgroundColor: c.border },
  tileFooter: {
    paddingHorizontal: 7,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: c.surface,
  },
  tileFooterRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tileFooterStylist: {
    fontSize: 11,
    fontFamily: 'Figtree_600SemiBold',
    color: c.primary,
    flex: 1,
  },
  photoDots: {
    position: 'absolute',
    bottom: 7,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  photoDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  photoDotActive: {
    backgroundColor: '#fff',
    width: 6,
    height: 6,
  },

  // Bookings
  bookingsList: {
    padding: 16,
    gap: 12,
  },
  bookingCard: {
    backgroundColor: c.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    gap: 4,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  bookingStylist: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
    flex: 1,
  },
  bookingService: {
    fontSize: 14,
    color: c.textSecondary,
    fontFamily: 'Figtree_500Medium',
  },
  bookingDate: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusUpcoming: {
    backgroundColor: '#FEF3CD',
  },
  statusCompleted: {
    backgroundColor: c.borderLight,
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
  },
  statusUpcomingText: {
    color: '#9A6200',
  },
  statusCompletedText: {
    color: c.textSecondary,
  },
  statusCancelledText: {
    color: '#dc2626',
  },

  // Empty state
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  popupCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.78,
    backgroundColor: c.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  popupCardWeb: {
    maxWidth: 460,
    maxHeight: SCREEN_HEIGHT * 0.82,
  },
});
