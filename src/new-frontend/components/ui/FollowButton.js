import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Outlined follow/following toggle button used on post detail + profile headers.
export default function FollowButton({ initialFollowing = false, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing);

  function handlePress() {
    const next = !following;
    setFollowing(next);
    onToggle?.(next);
  }

  return (
    <TouchableOpacity
      style={[styles.btn, following && styles.btnFollowing]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, following && styles.labelFollowing]}>
        {following ? 'Following' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1.5,
    borderColor: '#5D1F1F',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  btnFollowing: {
    backgroundColor: '#5D1F1F',
  },
  label: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 13,
    color: '#5D1F1F',
  },
  labelFollowing: {
    color: '#FFFFFF',
  },
});
