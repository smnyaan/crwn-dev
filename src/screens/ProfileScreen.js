import { useState } from 'react';
import { View, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import UserHeader from '../components/UserHeader';
import ProfileTabs from '../components/ProfileTabs';
import SettingsScreen from './SettingsScreen';

export default function ProfileScreen({ route, navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);

  const viewedUserId = route?.params?.viewedUserId || user?.id;
  const isOwnProfile = viewedUserId === user?.id;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <UserHeader
          key={profileVersion}
          viewedUserId={viewedUserId}
          isOwnProfile={isOwnProfile}
          onBack={
            route?.name === 'UserProfile'
              ? () => navigation.goBack()
              : undefined
          }
        />
        <ProfileTabs viewedUserId={viewedUserId} isOwnProfile={isOwnProfile} />
      </ScrollView>

      {/* Settings button as absolute overlay — outside ScrollView so touches are never swallowed */}
      {isOwnProfile && (
        <TouchableOpacity
          style={[styles.settingsOverlay, { top: insets.top + 8 }]}
          onPress={() => setSettingsVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      )}

      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SettingsScreen
          onClose={() => setSettingsVisible(false)}
          onProfileUpdated={() => setProfileVersion(v => v + 1)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  settingsOverlay: {
    position: 'absolute',
    right: 18,
    padding: 6,
    zIndex: 100,
  },
});
