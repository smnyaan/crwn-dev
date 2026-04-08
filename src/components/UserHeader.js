import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import EditProfileScreen from '../screens/EditProfileScreen';

const BRAND = '#5D1F1F';

/**
 * UserHeader
 *
 * Props:
 *   viewedUserId  — ID of the profile being displayed
 *   isOwnProfile  — boolean; true when the signed-in user is viewing their own profile
 */
export default function UserHeader({ viewedUserId, isOwnProfile, onBack, onSettingsPress }) {
  const { user, refreshProfile } = useAuth();
  const navigation = useNavigation();

  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [following, setFollowing]     = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [followList, setFollowList]   = useState(null); // { title, data }
  const [followListLoading, setFollowListLoading] = useState(false);

  // Fetch the viewed user's profile whenever the target ID changes
  useEffect(() => {
    if (viewedUserId) {
      fetchProfile();
      if (!isOwnProfile && user?.id) checkFollowing();
    } else {
      setLoading(false);
    }
  }, [viewedUserId]);

  const checkFollowing = async () => {
    const { isFollowing: result } = await profileService.isFollowing(user.id, viewedUserId);
    setFollowing(result);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await profileService.getProfile(viewedUserId);
      if (error) {
        console.error('UserHeader: Error fetching profile:', error);
        // Fallback for own profile only
        if (isOwnProfile && user) {
          setProfile({
            full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            username: user.email?.split('@')[0] || 'user',
            email: user.email,
            avatar_url: null,
            followers_count: 0,
            following_count: 0,
            bio: null,
          });
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('UserHeader: Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Avatar upload (own profile only) ───────────────────────────────────────

  const pickImage = () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      { text: 'Take Photo',           onPress: takePhoto },
      { text: 'Choose from Library',  onPress: chooseFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) uploadAvatar(result.assets[0].uri);
  };

  const chooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) uploadAvatar(result.assets[0].uri);
  };

  const uploadAvatar = async (uri) => {
    if (!user?.id) return;
    setUploading(true);
    const { url, error } = await profileService.uploadAvatar(user.id, uri);
    if (error) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: url }));
      await refreshProfile(user.id);
      Alert.alert('Success', 'Profile picture updated!');
    }
    setUploading(false);
  };

  // ── Follow / Unfollow (other profiles only) ────────────────────────────────

  const handleFollow = async () => {
    if (!user || followLoading) return;
    setFollowLoading(true);
    if (following) {
      await profileService.unfollowUser(user.id, viewedUserId);
      setFollowing(false);
    } else {
      await profileService.followUser(user.id, viewedUserId);
      setFollowing(true);
    }
    // Re-fetch to get the true count from DB
    await fetchProfile();
    setFollowLoading(false);
  };

  // ── Edit Profile ──────────────────────────────────────────────────────────

  const handleEditProfile = () => setEditVisible(true);

  // ── Share Profile ─────────────────────────────────────────────────────────

  const handleShare = async () => {
    const name = profile?.full_name || profile?.username || 'this user';
    const handle = profile?.username ? `@${profile.username}` : '';
    try {
      await Share.share({
        message: `Check out ${name}'s profile on CRWN! ${handle}`,
        title: `${name} on CRWN`,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  // ── Followers / Following list ────────────────────────────────────────────

  const openFollowers = async () => {
    setFollowList({ title: 'Followers', data: [] });
    setFollowListLoading(true);
    const { data } = await profileService.getFollowers(viewedUserId);
    setFollowList({ title: 'Followers', data: data || [] });
    setFollowListLoading(false);
  };

  const openFollowing = async () => {
    setFollowList({ title: 'Following', data: [] });
    setFollowListLoading(true);
    const { data } = await profileService.getFollowing(viewedUserId);
    setFollowList({ title: 'Following', data: data || [] });
    setFollowListLoading(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  const emailPrefix     = user?.email?.split('@')[0];
  const displayName     = profile?.full_name || profile?.username || emailPrefix || 'User';
  const displayUsername = profile?.username   || emailPrefix || 'user';

  const AVATAR_SIZE = 90;
  const BANNER_HEIGHT = 110;

  return (
    <View style={styles.wrapper}>
      {/* ── Gradient Banner ── */}
      <LinearGradient
        colors={['#5D1F1F', '#C8835A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.banner, { height: BANNER_HEIGHT }]}
      >
        <SafeAreaView edges={['top']} style={styles.bannerSafe}>
          <View style={styles.bannerRow}>
            {onBack && (
              <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            {isOwnProfile && (
              <TouchableOpacity style={styles.settingsBtn} onPress={onSettingsPress}>
                <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Avatar overlapping banner ── */}
      <View style={[styles.avatarRow, { marginTop: -(AVATAR_SIZE / 2) }]}>
        <TouchableOpacity
          onPress={isOwnProfile ? pickImage : undefined}
          activeOpacity={isOwnProfile ? 0.8 : 1}
          style={[styles.avatarRing, { width: AVATAR_SIZE + 4, height: AVATAR_SIZE + 4, borderRadius: (AVATAR_SIZE + 4) / 2 }]}
        >
          {uploading ? (
            <View style={[styles.avatar, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }]}>
              <ActivityIndicator size="small" color={BRAND} />
            </View>
          ) : profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={[styles.avatar, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }]}>
              <Ionicons name="person" size={44} color="#9ca3af" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Profile info ── */}
      <View style={styles.info}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.username}>@{displayUsername}</Text>

        {profile?.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : null}

        {/* Stats */}
        <View style={styles.stats}>
          <TouchableOpacity style={styles.stat} onPress={openFollowers}>
            <Text style={styles.statNumber}>{profile?.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={openFollowing}>
            <Text style={styles.statNumber}>{profile?.following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity style={styles.btn} onPress={handleEditProfile}>
                <Text style={styles.btnText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={15} color="#111827" style={{ marginRight: 5 }} />
                <Text style={styles.btnText}>Share</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, following ? styles.followingBtn : styles.followBtn]}
                onPress={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={following ? BRAND : '#fff'} />
                ) : (
                  <Text style={[styles.btnText, following ? styles.followingBtnText : styles.followBtnText]}>
                    {following ? 'Following' : 'Follow'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn}>
                <Text style={styles.btnText}>Message</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditVisible(false)}>
        <EditProfileScreen
          onBack={() => setEditVisible(false)}
          onSave={() => { setEditVisible(false); fetchProfile(); }}
        />
      </Modal>

      {/* ── Followers / Following Modal ── */}
      <Modal
        visible={!!followList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFollowList(null)}
      >
        <SafeAreaView style={styles.listSheet} edges={['top']}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{followList?.title}</Text>
            <TouchableOpacity onPress={() => setFollowList(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {followListLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={BRAND} />
          ) : (
            <FlatList
              data={followList?.data}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={
                <Text style={styles.listEmpty}>No {followList?.title?.toLowerCase()} yet.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setFollowList(null);
                    navigation.navigate('UserProfile', { viewedUserId: item.id });
                  }}
                >
                  {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.listAvatar} />
                  ) : (
                    <View style={styles.listAvatarPlaceholder}>
                      <Ionicons name="person" size={18} color="#9ca3af" />
                    </View>
                  )}
                  <View style={styles.listRowText}>
                    <Text style={styles.listRowName}>{item.full_name || item.username}</Text>
                    <Text style={styles.listRowUsername}>@{item.username}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FCFCFC',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFCFC',
  },

  // ── Banner ──
  banner: {
    width: '100%',
  },
  bannerSafe: {
    flex: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: {
    padding: 6,
  },
  settingsBtn: {
    padding: 6,
  },

  // ── Avatar ──
  avatarRow: {
    alignItems: 'center',
    zIndex: 1,
  },
  avatarRing: {
    backgroundColor: '#FCFCFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Info block ──
  info: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#FCFCFC',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Figtree_700Bold',
    color: '#111827',
    marginBottom: 3,
  },
  username: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  // ── Stats ──
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 56,
    marginBottom: 18,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
  },

  // ── Buttons ──
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    backgroundColor: '#FCFCFC',
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: '#111827',
  },
  followBtn: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  followBtnText: {
    color: '#fff',
  },
  followingBtn: {
    backgroundColor: '#FCFCFC',
    borderColor: BRAND,
  },
  followingBtnText: {
    color: BRAND,
  },

  // ── Follow list modal ──
  listSheet: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  listTitle: {
    fontSize: 17,
    fontFamily: 'Figtree_700Bold',
    color: '#111827',
  },
  listEmpty: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
    fontSize: 14,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
  },
  listAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRowText: {
    flex: 1,
  },
  listRowName: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: '#111827',
  },
  listRowUsername: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 1,
  },
});