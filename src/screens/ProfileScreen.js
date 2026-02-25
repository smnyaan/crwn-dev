import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserHeader from '../components/UserHeader';
import HairProfile from '../components/HairProfile';
import ProfileTabs from '../components/ProfileTabs';
import SettingsScreen from './SettingsScreen';
import { useAuth } from '../hooks/useAuth';

// This is the Profile TAB - always shows the current user's profile
export default function ProfileScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // DEBUG - remove later
  console.log('ProfileScreen - authLoading:', authLoading);
  console.log('ProfileScreen - user:', user);
  console.log('ProfileScreen - user?.id:', user?.id);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D1F1F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Settings Icon - Top Right */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
      >
        <Ionicons name="settings-outline" size={24} color="#5D1F1F" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <UserHeader userId={user?.id} isOwnProfile={true} />
        <HairProfile userId={user?.id} isOwnProfile={true} />
        <ProfileTabs userId={user?.id} isOwnProfile={true} />
      </ScrollView>

      {/* Settings Modal */}
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
    backgroundColor: '#ffffff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
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
