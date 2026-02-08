import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import UserHeader from '../components/UserHeader';
import HairProfile from '../components/HairProfile';
import ProfileTabs from '../components/ProfileTabs';
import SettingsScreen from './SettingsScreen';

export default function ProfileScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const handleCloseSettings = () => {
    setSettingsVisible(false);
    // Trigger a refresh when settings/edit profile closes
    setRefreshKey(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* Settings Icon - Top Right */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
      >
        <Ionicons name="settings-outline" size={24} color="#5D1F1F" />
      </TouchableOpacity>

      {/* ProfileTabs now handles all scrolling */}
      <ProfileTabs 
        key={`tabs-${refreshKey}`}
        headerComponent={
          <>
            <UserHeader key={`header-${refreshKey}`} />
            <HairProfile key={`hair-${refreshKey}`} />
          </>
        }
      />

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseSettings}
      >
        <SettingsScreen onClose={handleCloseSettings} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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