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

export default function EditProfileScreen({ onBack, onSave }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  
  // Hair profile fields
  const [hairType, setHairType] = useState('');
  const [porosity, setPorosity] = useState('');
  const [density, setDensity] = useState('');
  const [texture, setTexture] = useState('');
  const [length, setLength] = useState('');
  const [goals, setGoals] = useState([]);
  const [goalsInput, setGoalsInput] = useState('');

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
      // Set profile data
      setFullName(data.full_name || '');
      setUsername(data.username || '');
      setBio(data.bio || '');
      setLocation(data.location || '');
      setPhone(data.phone || '');
      
      // Set hair profile data
      const hairProfile = data.hair_profiles?.[0];
      if (hairProfile) {
        setHairType(hairProfile.hair_type || '');
        setPorosity(hairProfile.porosity || '');
        setDensity(hairProfile.density || '');
        setTexture(hairProfile.texture || '');
        setLength(hairProfile.length || '');
        
        // Parse goals if it's a JSON string
        const goalsData = typeof hairProfile.goals === 'string' 
          ? JSON.parse(hairProfile.goals || '[]')
          : hairProfile.goals || [];
        setGoals(goalsData);
        setGoalsInput(goalsData.join(', '));
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

    // Update profile
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

    // Parse goals from comma-separated string
    const parsedGoals = goalsInput
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    // Update hair profile
    const { error: hairError } = await profileService.updateHairProfile(user.id, {
      hair_type: hairType,
      porosity: porosity,
      density: density,
      texture: texture,
      length: length,
      goals: parsedGoals,
    });

    if (hairError) {
      console.error('Hair profile update error:', hairError);
      Alert.alert('Warning', 'Profile updated but hair profile update failed');
    }

    setSaving(false);
    Alert.alert('Success', 'Profile updated!', [
      {
        text: 'OK',
        onPress: () => {
          // Notify parent to refresh
          if (onSave) {
            onSave();
          }
          if (onBack) {
            onBack();
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D1F1F" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#5D1F1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.headerButton}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#5D1F1F" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, State"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
          />
        </View>

        {/* Hair Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hair Profile</Text>
          <Text style={styles.sectionDescription}>
            This information helps us personalize your experience
          </Text>
          
          <Text style={styles.label}>Hair Type</Text>
          <TextInput
            style={styles.input}
            value={hairType}
            onChangeText={setHairType}
            placeholder="e.g., Type 4C, 3B, Coily"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Porosity</Text>
          <TextInput
            style={styles.input}
            value={porosity}
            onChangeText={setPorosity}
            placeholder="Low, Medium, High"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Density</Text>
          <TextInput
            style={styles.input}
            value={density}
            onChangeText={setDensity}
            placeholder="Low, Medium, High"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Texture</Text>
          <TextInput
            style={styles.input}
            value={texture}
            onChangeText={setTexture}
            placeholder="e.g., Coarse, Fine, Medium"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Length</Text>
          <TextInput
            style={styles.input}
            value={length}
            onChangeText={setLength}
            placeholder="e.g., Short, Shoulder Length, Long"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Hair Goals</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={goalsInput}
            onChangeText={setGoalsInput}
            placeholder="e.g., Hair growth, Damage repair, Moisture retention (separate with commas)"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
          <Text style={styles.helpText}>
            Separate multiple goals with commas
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D1F1F',
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
