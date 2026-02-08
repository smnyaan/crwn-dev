import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';

export default function HairProfile() {
  const { user } = useAuth();
  const [hairProfile, setHairProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHairProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHairProfile = async () => {
    if (!user?.id) {
      console.log('HairProfile: No user ID, skipping fetch');
      setLoading(false);
      return;
    }

    console.log('HairProfile: Fetching hair profile for user:', user.id);
    setLoading(true);
    
    try {
      const { data, error } = await profileService.getProfile(user.id);
      
      if (error) {
        console.error('HairProfile: Error fetching profile:', error);
        setHairProfile(null);
      } else {
        // Hair profile is nested in the profile data
        const hairData = data?.hair_profiles?.[0] || null;
        console.log('HairProfile: Hair data:', hairData);
        setHairProfile(hairData);
      }
    } catch (err) {
      console.error('HairProfile: Unexpected error:', err);
      setHairProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#5D1F1F" />
      </View>
    );
  }

  if (!hairProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Hair Profile</Text>
        <Text style={styles.emptyText}>
          Add your hair profile to get personalized recommendations
        </Text>
      </View>
    );
  }

  // Parse goals if it's a string (from database)
  const goals = typeof hairProfile.goals === 'string' 
    ? JSON.parse(hairProfile.goals || '[]')
    : hairProfile.goals || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Hair Profile</Text>
      
      <View style={styles.tagsContainer}>
        {hairProfile.hair_type && (
          <View style={[styles.tag, styles.primaryTag]}>
            <Ionicons name="water-outline" size={14} color="#5D1F1F" />
            <Text style={styles.primaryTagText}>{hairProfile.hair_type}</Text>
          </View>
        )}

        {hairProfile.porosity && (
          <View style={[styles.tag, styles.primaryTag]}>
            <Ionicons name="prism-outline" size={14} color="#5D1F1F" />
            <Text style={styles.primaryTagText}>{hairProfile.porosity} Porosity</Text>
          </View>
        )}

        {hairProfile.texture && (
          <View style={[styles.tag, styles.primaryTag]}>
            <Ionicons name="git-branch-outline" size={14} color="#5D1F1F" />
            <Text style={styles.primaryTagText}>{hairProfile.texture}</Text>
          </View>
        )}

        {hairProfile.length && (
          <View style={[styles.tag, styles.primaryTag]}>
            <Ionicons name="resize-outline" size={14} color="#5D1F1F" />
            <Text style={styles.primaryTagText}>{hairProfile.length}</Text>
          </View>
        )}

        {hairProfile.density && (
          <View style={[styles.tag, styles.secondaryTag]}>
            <Text style={styles.secondaryTagText}>{hairProfile.density} Density</Text>
          </View>
        )}
      </View>

      {/* Hair Goals Section */}
      {goals.length > 0 && (
        <View style={styles.goalsSection}>
          <Text style={styles.sectionLabel}>Hair Goals</Text>
          <View style={styles.goalsContainer}>
            {goals.map((goal, index) => (
              <View key={index} style={styles.goalTag}>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Additional characteristics */}
      {hairProfile.characteristics && hairProfile.characteristics.length > 0 && (
        <View style={styles.characteristicsSection}>
          <Text style={styles.sectionLabel}>Characteristics</Text>
          <View style={styles.tagsContainer}>
            {hairProfile.characteristics.map((char, index) => (
              <View key={index} style={styles.secondaryTag}>
                <Text style={styles.secondaryTagText}>{char}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FDF8F3',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8DFD6',
  },
  loadingContainer: {
    padding: 16,
    backgroundColor: '#FDF8F3',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DFD6',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  primaryTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  primaryTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5D1F1F',
  },
  secondaryTag: {
    backgroundColor: '#F3EDE4',
    borderWidth: 1,
    borderColor: '#E0D5C7',
  },
  secondaryTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7A6952',
  },
  goalsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8DFD6',
  },
  characteristicsSection: {
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5E5E5E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalTag: {
    backgroundColor: '#5D1F1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
