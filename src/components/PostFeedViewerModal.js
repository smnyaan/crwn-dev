import React, { useRef, useEffect } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import PostCard from './PostCard';
import { HEADER_BAR_HEIGHT } from './ScreenHeader';

const { width: SCREEN_W } = Dimensions.get('window');
const DISMISS_THRESHOLD = 80;

/**
 * Rendered as an absolutely-positioned full-screen overlay (not a Modal).
 *
 * slideFrom="right" (default) — slides in from the right, swipe right to dismiss.
 *   Used by ExploreScreen for the post feed.
 *
 * slideFrom="left" — slides in from the left, swipe left to dismiss.
 *   Used by ProfileTabs for single-post detail view.
 */
export default function PostFeedViewerModal({
  visible,
  posts = [],
  initialIndex = 0,
  onClose,
  onDelete,
  onNavigateToProfile,
  onNavigateToStylist,
  slideFrom = 'right',
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const fromLeft = slideFrom === 'left';
  const startX   = fromLeft ? -SCREEN_W : SCREEN_W;
  const translateX = useRef(new Animated.Value(startX)).current;
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const visiblePosts = posts.slice(initialIndex);

  useEffect(() => {
    if (visible) {
      translateX.setValue(startX);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      animateClose();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  const snapBack = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  };

  const animateClose = () => {
    Animated.timing(translateX, {
      toValue: startX,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onCloseRef.current?.());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => {
        if (fromLeft) return gs.dx < -10 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2;
        return gs.dx > 10 && gs.dx > Math.abs(gs.dy) * 2;
      },
      onPanResponderMove: (_, gs) => {
        if (fromLeft && gs.dx < 0) translateX.setValue(gs.dx);
        if (!fromLeft && gs.dx > 0) translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        const dismissed = fromLeft
          ? gs.dx < -DISMISS_THRESHOLD || gs.vx < -0.5
          : gs.dx > DISMISS_THRESHOLD  || gs.vx > 0.5;
        if (dismissed) animateClose();
        else snapBack();
      },
      onPanResponderTerminate: () => snapBack(),
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.root,
        { backgroundColor: '#F9F9F9', transform: [{ translateX }] },
      ]}
      pointerEvents={visible ? 'box-none' : 'none'}
      {...panResponder.panHandlers}
    >
      {/* Top safe-area bar + header */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, paddingTop: insets.top, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={animateClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: colors.surfaceAlt ?? colors.borderLight }]}
          >
            <Ionicons name={fromLeft ? 'chevron-forward' : 'chevron-back'} size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Post</Text>
          <View style={styles.backBtn} />
        </View>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
            <PostCard
              post={item}
              currentUserId={user?.id}
              onDelete={onDelete}
              onNavigateToProfile={onNavigateToProfile}
              onNavigateToStylist={onNavigateToStylist}
            />
          </View>
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  topBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Figtree_700Bold',
  },
  card: {
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  listContent: {
    paddingBottom: 40,
  },
});
