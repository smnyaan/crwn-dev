import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useUnreadCount } from '../context/UnreadCountContext';
import { bookingService } from '../services/bookingService';
import { supabase } from '../config/supabase';

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// ── Type config ────────────────────────────────────────────────────────────────

const TYPE_CFG = {
  booking_request:   { icon: 'calendar-outline',     color: '#F59E0B', bg: '#FEF9EC', label: 'New Request'  },
  booking_confirmed: { icon: 'checkmark-circle',      color: '#10B981', bg: '#ECFDF5', label: 'Confirmed'    },
  booking_declined:  { icon: 'close-circle-outline',  color: '#EF4444', bg: '#FEF2F2', label: 'Declined'     },
};

function getTypeCfg(type) {
  return TYPE_CFG[type] || { icon: 'notifications-outline', color: '#C8835A', bg: '#FDF1EE', label: 'Notification' };
}

// ── Notification row ───────────────────────────────────────────────────────────

function NotifRow({ item, styles, colors, onAccept, onDecline, onRead }) {
  const cfg      = getTypeCfg(item.type);
  const isPending = item.type === 'booking_request';
  const actor    = item.actor;
  const actorName = actor?.full_name || actor?.username || 'A client';

  return (
    <TouchableOpacity
      style={[styles.row, !item.is_read && styles.rowUnread]}
      onPress={() => onRead(item.id)}
      activeOpacity={0.75}
    >
      {/* Icon */}
      <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
        </View>
        {item.body ? (
          <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>{item.body}</Text>
        ) : null}
        <Text style={[styles.time, { color: colors.textMuted }]}>{timeAgo(item.created_at)}</Text>

        {/* Inline Accept / Decline for booking requests */}
        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.declineBtn]}
              onPress={() => onDecline(item)}
              activeOpacity={0.75}
            >
              <Ionicons name="close" size={13} color="#ef4444" />
              <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => onAccept(item)}
              activeOpacity={0.75}
            >
              <LinearGradient colors={['#5D1F1F', '#C8835A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} borderRadius={8} />
              <Ionicons name="checkmark" size={13} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Actor avatar */}
      {actor?.avatar_url ? (
        <Image source={{ uri: actor.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.borderLight }]}>
          <Ionicons name="person" size={16} color={colors.border} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function ProviderNotificationsScreen() {
  const { user }                        = useAuth();
  const { colors }                      = useTheme();
  const { clearBookingNotifs }          = useUnreadCount();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('booking_notifications')
      .select(`
        *,
        actor:actor_id (id, username, full_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);
  }, [user?.id]);

  useEffect(() => {
    fetchNotifs().finally(() => setLoading(false));

    // Mark all as read when screen is opened
    if (user?.id) {
      bookingService.markAllRead(user.id).then(() => clearBookingNotifs?.());
    }

    // Realtime: prepend new notifications as they arrive
    const ch = supabase
      .channel(`prov_notifs:${user?.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'booking_notifications',
        filter: `user_id=eq.${user?.id}`,
      }, (payload) => {
        if (payload.new) setNotifications(prev => [{ ...payload.new, is_read: true }, ...prev]);
      })
      .subscribe();

    return () => ch?.unsubscribe();
  }, [fetchNotifs, user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifs();
    setRefreshing(false);
  };

  // ── Mark single read ───────────────────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    await supabase.from('booking_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }, []);

  // ── Accept ─────────────────────────────────────────────────────────────────
  const handleAccept = useCallback(async (notif) => {
    if (!notif.booking_id) return;
    const { error } = await bookingService.acceptBooking(notif.booking_id);
    if (error) { Alert.alert('Error', 'Could not accept booking.'); return; }

    // Notify client
    const clientId = notif.actor_id;
    if (clientId) {
      await bookingService.sendNotification(clientId, {
        title: 'Booking Confirmed!',
        body: notif.body?.replace('New ', '').replace(' request', ' appointment has been confirmed') || 'Your appointment has been confirmed.',
        type: 'booking_confirmed',
        bookingId: notif.booking_id,
        actorId: user.id,
      });
    }

    // Replace the row with a "Accepted" version
    setNotifications(prev => prev.map(n =>
      n.id === notif.id ? { ...n, type: 'booking_confirmed', title: 'Request Accepted', is_read: true } : n
    ));
  }, [user?.id]);

  // ── Decline ────────────────────────────────────────────────────────────────
  const handleDecline = useCallback(async (notif) => {
    Alert.alert('Decline Booking', 'Are you sure you want to decline this request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: async () => {
        if (!notif.booking_id) return;
        const { error } = await bookingService.declineBooking(notif.booking_id);
        if (error) { Alert.alert('Error', 'Could not decline booking.'); return; }

        const clientId = notif.actor_id;
        if (clientId) {
          await bookingService.sendNotification(clientId, {
            title: 'Booking Update',
            body: 'Your booking request was not accepted. Feel free to request another time.',
            type: 'booking_declined',
            bookingId: notif.booking_id,
            actorId: user.id,
          });
        }

        setNotifications(prev => prev.map(n =>
          n.id === notif.id ? { ...n, type: 'booking_declined', title: 'Request Declined', is_read: true } : n
        ));
      }},
    ]);
  }, [user?.id]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.hairline, backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.hairline, backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        {notifications.some(n => !n.is_read) && (
          <TouchableOpacity onPress={() => {
            bookingService.markAllRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            clearBookingNotifs?.();
          }}>
            <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NotifRow
            item={item}
            styles={styles}
            colors={colors}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onRead={markRead}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-outline" size={52} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              New booking requests and updates will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const makeStyles = (c) => StyleSheet.create({
  safe:   { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 22, fontFamily: 'LibreBaskerville_700Bold' },
  markAll:     { fontSize: 13, fontFamily: 'Figtree_600SemiBold' },

  // List row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
    backgroundColor: c.surface,
  },
  rowUnread: { backgroundColor: c.unread || '#FFFDF9' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title:     { fontSize: 14, fontFamily: 'Figtree_700Bold', flex: 1 },
  body:      { fontSize: 13, fontFamily: 'Figtree_400Regular', lineHeight: 18 },
  time:      { fontSize: 11, fontFamily: 'Figtree_400Regular', marginTop: 2 },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5 },
  avatar:    { width: 38, height: 38, borderRadius: 19, flexShrink: 0 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },

  // Action buttons
  actionRow:   { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
    overflow: 'hidden',
  },
  declineBtn:  { borderWidth: 1, borderColor: '#ef4444' },
  acceptBtn:   {},
  actionBtnText: { fontSize: 12, fontFamily: 'Figtree_600SemiBold' },

  // Empty
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40 },
  emptyContainer: { flex: 1 },
  emptyText:      { fontSize: 16, fontFamily: 'Figtree_600SemiBold' },
  emptySub:       { fontSize: 13, fontFamily: 'Figtree_400Regular', textAlign: 'center', lineHeight: 19 },
});
