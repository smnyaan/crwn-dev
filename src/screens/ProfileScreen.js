import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import UserHeader from '../components/UserHeader';
import HairProfile from '../components/HairProfile';
import ProfileTabs from '../components/ProfileTabs';
import SettingsScreen from './SettingsScreen';

/**
 * ProfileScreen
 *
 * Props:
 *   viewedUserId (optional) — the user ID whose profile to display.
 *                             Defaults to the currently signed-in user.
 *                             Pass this when navigating to another user's profile.
 */
export default function ProfileScreen({ viewedUserId: viewedUserIdProp } = {}) {
  const { user } = useAuth();
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Resolve which user's profile we're viewing
  const viewedUserId = viewedUserIdProp || user?.id;
  const isOwnProfile = viewedUserId === user?.id;

  return (
    <View style={styles.container}>
      {/* Settings gear only shown on your own profile */}
      {isOwnProfile && (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#5D1F1F" />
        </TouchableOpacity>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <UserHeader viewedUserId={viewedUserId} isOwnProfile={isOwnProfile} />
        <HairProfile viewedUserId={viewedUserId} />
        <ProfileTabs  viewedUserId={viewedUserId} isOwnProfile={isOwnProfile} />
      </ScrollView>

      {/* Settings modal — only reachable from own profile anyway */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SettingsScreen onClose={() => setSettingsVisible(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});