import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserHeader from '../components/UserHeader';
import HairProfile from '../components/HairProfile';
import ProfileTabs from '../components/ProfileTabs';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import { useAuth } from '../hooks/useAuth';
import { colors, fonts } from '../theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);

  const handleEditProfile = () => {
    setEditProfileVisible(true);
  };

  const handleShareProfile = async () => {
    try {
      const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'user';
      
      const message = `Check out my CRWN profile! 👑\n\n@${username}\n\nJoin CRWN - The community for natural hair care and styling.`;
      
      const result = await Share.share({
        message: message,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared via:', result.activityType);
        } else {
          console.log('Profile shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share profile. Please try again.');
      console.error('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
      >
        <Ionicons name="settings-outline" size={24} color={colors.maroon} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <UserHeader 
          onEditProfile={handleEditProfile}
          onShareProfile={handleShareProfile}
        />
        <HairProfile />
        <ProfileTabs />
      </ScrollView>

      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SettingsScreen onClose={() => setSettingsVisible(false)} />
      </Modal>

      <Modal
        visible={editProfileVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <EditProfileScreen onBack={() => setEditProfileVisible(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});