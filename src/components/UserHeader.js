import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { colors, fonts } from '../theme';

export default function UserHeader({ onEditProfile, onShareProfile }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) {
      console.log('UserHeader: No user ID, skipping fetch');
      setLoading(false);
      return;
    }

    console.log('UserHeader: Fetching profile for user:', user.id);
    setLoading(true);
    
    try {
      const { data, error } = await profileService.getProfile(user.id);
      
      if (error) {
        console.error('UserHeader: Error fetching profile:', error);
        setProfile({
          full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          email: user.email,
          avatar_url: null,
          followers_count: 0,
          following_count: 0,
          bio: null,
        });
      } else {
        console.log('UserHeader: Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('UserHeader: Unexpected error:', err);
      setProfile({
        full_name: user.email?.split('@')[0] || 'User',
        username: user.email?.split('@')[0] || 'user',
        email: user.email,
        avatar_url: null,
        followers_count: 0,
        following_count: 0,
        bio: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto
        },
        {
          text: 'Choose from Library',
          onPress: chooseFromLibrary
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const chooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri) => {
    if (!user?.id) return;
    
    setUploading(true);
    const { url, error } = await profileService.uploadAvatar(user.id, uri);
    
    if (error) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
      console.error('Upload error:', error);
    } else {
      setProfile(prev => ({ ...prev, avatar_url: url }));
      Alert.alert('Success', 'Profile picture updated!');
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.maroon} />
      </View>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayUsername = profile?.username || user?.email?.split('@')[0] || 'user';

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[colors.warmBrown, colors.burntOchre, colors.honey]}
        // colors={['#8B4513', '#D2691E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {uploading ? (
                <View style={styles.avatar}>
                  <ActivityIndicator size="small" color={colors.maroon} />
                </View>
              ) : profile?.avatar_url ? (
                <Image 
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={colors.charcoalGrey} />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color={colors.white} />
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.container}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.username}>@{displayUsername}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{profile?.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>{profile?.following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={onEditProfile}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={onShareProfile}
          >
            <Text style={styles.buttonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        {profile?.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  gradientHeader: {
    width: '100%'
  },
  safeArea: {
    justifyContent: 'flex-end',
    paddingBottom: 20
  },
  avatarSection: {
    alignItems: 'center'
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.slateGrey,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.slateGrey,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.maroon,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white
  },
  container: {
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    paddingTop: 12
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 16
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
    color: colors.textPrimary,
    marginBottom: 4
  },
  username: {
    fontSize: 15,
    fontFamily: 'Figtree-Regular',
    color: colors.textMuted
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
    marginBottom: 16
  },
  stat: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
    color: colors.textPrimary,
    marginBottom: 2
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Figtree-Regular',
    color: colors.textMuted
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slateGrey,
    backgroundColor: colors.white,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Figtree-SemiBold',
    color: colors.textPrimary
  },
  bioSection: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.champagne
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Figtree-Regular',
    color: colors.textSecondary,
    textAlign: 'center'
  }
});