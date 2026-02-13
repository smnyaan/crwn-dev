import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import UserHeader from '../components/UserHeader';
import HairProfile from '../components/HairProfile';
import ProfileTabs from '../components/ProfileTabs';

// This screen is for viewing OTHER users' profiles
// It's separate from ProfileScreen which is for the current user's profile in the tab
export default function UserProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Get userId from route params
  const { userId } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#5D1F1F" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <UserHeader userId={userId} isOwnProfile={false} />
        <HairProfile userId={userId} isOwnProfile={false} />
        <ProfileTabs userId={userId} isOwnProfile={false} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
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
