import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';

const DEFAULTS = {
  appUpdates: true,
  communityPosts: true,
  stylistMatches: false,
  newContent: true,
  promotions: false,
  likes: true,
  comments: true,
  follows: true,
  messages: true,
};

export default function NotificationSettings({ onBack }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  // Load preferences from profiles.notification_prefs
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('notification_prefs')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.notification_prefs) {
          setNotifications({ ...DEFAULTS, ...data.notification_prefs });
        }
        setLoading(false);
      });
  }, [user?.id]);

  const savePrefs = (prefs) => {
    if (!user?.id) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await supabase
        .from('profiles')
        .update({ notification_prefs: prefs })
        .eq('id', user.id);
      setSaving(false);
    }, 800);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      savePrefs(updated);
      return updated;
    });
  };

  return (
    <View style={styles.fullContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5D1F1F" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Notifications</Text>
        <View style={styles.statusArea}>
          {saving && <ActivityIndicator size="small" color="#5D1F1F" />}
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#5D1F1F" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Respect your attention</Text>
            <Text style={styles.headerDescription}>
              Choose what notifications you want to receive. We believe in quality over quantity.
            </Text>
          </View>

          {/* App & Community */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App & Community</Text>

            <NotifRow
              label="App Updates"
              description="New features and improvements"
              value={notifications.appUpdates}
              onToggle={() => toggleNotification('appUpdates')}
            />
            <NotifRow
              label="Community Posts"
              description="New posts from people you follow"
              value={notifications.communityPosts}
              onToggle={() => toggleNotification('communityPosts')}
            />
            <NotifRow
              label="New Content Drops"
              description="Hair care tips, tutorials & articles"
              value={notifications.newContent}
              onToggle={() => toggleNotification('newContent')}
            />
          </View>

          {/* Stylists */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stylists</Text>
            <NotifRow
              label="Stylist Matches"
              description="When stylists match your hair profile"
              value={notifications.stylistMatches}
              onToggle={() => toggleNotification('stylistMatches')}
            />
          </View>

          {/* Social */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social</Text>
            <NotifRow
              label="Likes"
              description="Someone likes your post"
              value={notifications.likes}
              onToggle={() => toggleNotification('likes')}
            />
            <NotifRow
              label="Comments"
              description="Someone comments on your post"
              value={notifications.comments}
              onToggle={() => toggleNotification('comments')}
            />
            <NotifRow
              label="New Followers"
              description="Someone follows you"
              value={notifications.follows}
              onToggle={() => toggleNotification('follows')}
            />
            <NotifRow
              label="Messages"
              description="Direct messages from community"
              value={notifications.messages}
              onToggle={() => toggleNotification('messages')}
            />
          </View>

          {/* Promotions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promotions (Optional)</Text>
            <NotifRow
              label="Special Offers"
              description="Product deals & partner discounts"
              value={notifications.promotions}
              onToggle={() => toggleNotification('promotions')}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function NotifRow({ label, description, value, onToggle }) {
  return (
    <View style={styles.option}>
      <View style={styles.optionContent}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d5db', true: '#5D1F1F' }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#FDF9F0' },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#FDF9F0',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 18, fontFamily: 'Figtree_600SemiBold', color: '#111827' },
  statusArea: { width: 40, alignItems: 'center' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#FDF9F0' },
  header: { padding: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontFamily: 'Figtree_700Bold', color: '#5D1F1F', marginBottom: 8 },
  headerDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  section: {
    marginTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  optionContent: { flex: 1, marginRight: 16 },
  optionLabel: { fontSize: 16, fontFamily: 'Figtree_500Medium', color: '#111827', marginBottom: 2 },
  optionDescription: { fontSize: 13, color: '#6b7280' },
});
