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
//export default function ProfileScreen({ viewedUserId: viewedUserIdProp } = {}) {
export default function ProfileScreen({ route, navigation }) {  
  
  const { user } = useAuth();
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Resolve which user's profile we're viewing
  //const viewedUserId = viewedUserIdProp || user?.id;
  //const isOwnProfile = viewedUserId === user?.id;
  const viewedUserId = route?.params?.viewedUserId || user?.id;
  const isOwnProfile = viewedUserId === user?.id;
  
  const isStackProfile = route?.name === 'UserProfile';
  const showBack = isStackProfile && navigation?.canGoBack?.();

  return (
    <View style={styles.container}>

      {/* Settings gear only shown on your own profile */}
      {isOwnProfile && (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#ffff" />
        </TouchableOpacity>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <UserHeader
          viewedUserId={viewedUserId}
          isOwnProfile={isOwnProfile}
          onBack={
            route?.name === 'UserProfile'
              ? () => navigation.goBack()
              : undefined
          }
        />
        {/* <UserHeader viewedUserId={viewedUserId} isOwnProfile={isOwnProfile} /> */}
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
  padding: 6,
},
});