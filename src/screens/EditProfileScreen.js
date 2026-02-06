import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';

export default function EditProfileScreen({ onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  
  const [hairType, setHairType] = useState('');
  const [porosity, setPorosity] = useState('');
  const [density, setDensity] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await profileService.getProfile(user.id);
    
    if (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } else {
      setFullName(data.full_name || '');
      setUsername(data.username || '');
      setBio(data.bio || '');
      setLocation(data.location || '');
      setPhone(data.phone || '');
      
      const hairProfile = data.hair_profiles?.[0];
      if (hairProfile) {
        setHairType(hairProfile.hair_type || '');
        setPorosity(hairProfile.porosity || '');
        setDensity(hairProfile.density || '');
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim()) {
      Alert.alert('Error', 'Name and username are required');
      return;
    }

    setSaving(true);

    const { error: profileError } = await profileService.updateProfile(user.id, {
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      location: location.trim(),
      phone: phone.trim(),
    });

    if (profileError) {
      Alert.alert('Error', profileError.message || 'Failed to update profile');
      setSaving(false);
      return;
    }

    if (hairType || porosity || density) {
      const { error: hairError } = await profileService.updateHairProfile(user.id, {
        hair_type: hairType,
        porosity: porosity,
        density: density,
      });

      if (hairError) {
        console.error('Hair profile update error:', hairError);
      }
    }

    setSaving(false);
    Alert.alert('Success', 'Profile updated!', [
      { text: 'OK', onPress: onBack }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.maroon} />
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.maroon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="City, State"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hair Profile</Text>
            
            <Text style={styles.label}>Hair Type</Text>
            <TextInput
              style={styles.input}
              value={hairType}
              onChangeText={setHairType}
              placeholder="e.g., 3B, 4A, Relaxed"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Porosity</Text>
            <TextInput
              style={styles.input}
              value={porosity}
              onChangeText={setPorosity}
              placeholder="Low, Medium, High"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Density</Text>
            <TextInput
              style={styles.input}
              value={density}
              onChangeText={setDensity}
              placeholder="Low, Medium, High"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.champagne,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.h3,
    fontWeight: '600',
    fontFamily: 'Figtree-SemiBold',
    color: colors.textPrimary,
  },
  saveButton: {
    fontSize: fontSizes.h4,
    fontWeight: '600',
    fontFamily: 'Figtree-SemiBold',
    color: colors.maroon,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSizes.h3,
    fontWeight: '700',
    fontFamily: 'Figtree-Bold',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    fontFamily: 'Figtree-SemiBold',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slateGrey,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.h4,
    fontFamily: 'Figtree-Regular',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});