import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { profileService } from '../services/profileService';
import { useTheme } from '../context/ThemeContext';

/**
 * HairProfile
 *
 * Props:
 *   viewedUserId — ID of the profile being displayed.
 *                  No longer uses useAuth() directly so it works for any user.
 */
export default function HairProfile({ viewedUserId }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [hairProfile, setHairProfile] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (viewedUserId) {
      fetchHairProfile();
    } else {
      setLoading(false);
    }
  }, [viewedUserId]);

  const fetchHairProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await profileService.getProfile(viewedUserId);
      if (error) {
        console.error('HairProfile: Error fetching profile:', error);
        setHairProfile(null);
      } else {
        setHairProfile(data?.hair_profiles?.[0] || null);
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
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!hairProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Hair Profile</Text>
        <Text style={styles.emptyText}>
          No hair profile added yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hair Profile</Text>

      <View style={styles.characteristicsContainer}>
        {hairProfile.hair_type && (
          <View style={styles.characteristic}>
            <Text style={styles.label}>Hair Type</Text>
            <Text style={styles.value}>{hairProfile.hair_type}</Text>
          </View>
        )}
        {hairProfile.porosity && (
          <View style={styles.characteristic}>
            <Text style={styles.label}>Porosity</Text>
            <Text style={styles.value}>{hairProfile.porosity}</Text>
          </View>
        )}
        {hairProfile.density && (
          <View style={styles.characteristic}>
            <Text style={styles.label}>Density</Text>
            <Text style={styles.value}>{hairProfile.density}</Text>
          </View>
        )}
      </View>

      {hairProfile.characteristics?.length > 0 && (
        <View style={styles.tags}>
          {hairProfile.characteristics.map((char, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{char}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: c.surfaceAlt,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 16,
    backgroundColor: c.surfaceAlt,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Figtree_600SemiBold',
    color: c.text,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: c.textSecondary,
    textAlign: 'center',
  },
  characteristicsContainer: {
    marginBottom: 16,
  },
  characteristic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: c.textSecondary,
  },
  value: {
    fontSize: 14,
    fontFamily: 'Figtree_500Medium',
    color: c.text,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: c.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: c.text,
  },
});
