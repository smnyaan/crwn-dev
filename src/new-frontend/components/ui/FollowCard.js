import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Card with gradient background, user avatar initial, hair type tag, and follow button.
export default function FollowCard({ username, tag, gradientColors, isStylist = false }) {
  const [following, setFollowing] = useState(false);

  const initial = username ? username[0].toUpperCase() : '?';
  const colors = gradientColors || ['#8B6347', '#4A2511'];

  return (
    <View style={styles.card}>
      <LinearGradient colors={colors} style={styles.gradient} />
      <View style={styles.bottom}>
        <View style={styles.info}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <View style={styles.meta}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{username}</Text>
              {isStylist && (
                <View style={styles.stylistBadge}>
                  <Text style={styles.stylistBadgeText}>Stylist</Text>
                </View>
              )}
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.followButton, following && styles.followingButton]}
          onPress={() => setFollowing(!following)}
          activeOpacity={0.8}
        >
          <Text style={[styles.followText, following && styles.followingText]}>
            {following ? '✓ Following' : '+ Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 4,
    minHeight: 200,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  meta: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  stylistBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  stylistBadgeText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontFamily: 'Figtree-Regular',
    fontSize: 10,
    color: '#FFFFFF',
  },
  followButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
  },
  followText: {
    fontFamily: 'Figtree-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  followingText: {
    color: '#251C15',
  },
});
