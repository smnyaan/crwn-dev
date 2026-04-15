import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function CommunityGuidelines({ onBack }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const values = [
    {
      icon: 'heart-outline',
      title: 'Authenticity',
      description: 'Be yourself. Your natural hair journey is unique and worthy of celebration.',
    },
    {
      icon: 'ribbon-outline',
      title: 'Self-Love',
      description: 'Celebrate your crown. Uplift others. We grow together.',
    },
    {
      icon: 'star-outline',
      title: 'Excellence',
      description: 'Share knowledge, support stylists, and create quality content.',
    },
  ];

  const guidelines = [
    {
      title: '✅ Encouraged',
      items: [
        'Share your hair journey with honesty',
        'Give constructive feedback and recommendations',
        'Support local Black-owned hair businesses',
        'Ask questions without judgment',
        'Celebrate all hair types and textures',
        'Share tips, techniques, and products that work for you',
      ]
    },
    {
      title: '❌ Not Tolerated',
      items: [
        'Discrimination of any kind (hair texture, skin tone, etc.)',
        'Harassment or bullying',
        'Unsolicited negative comments about someone\'s hair',
        'Spam or promotional content without disclosure',
        'Inappropriate or explicit content',
        'Sharing others\' content without credit',
      ]
    },
  ];

  return (
    <View style={styles.fullContainer}>
      {/* Back Button Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5D1F1F" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Community Guidelines</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Our Community Values</Text>
          <Text style={styles.headerDescription}>
            CRWN is a safe space built on respect, authenticity, and love for our crowns.
          </Text>
        </View>

        {/* Core Values */}
        <View style={styles.valuesSection}>
          {values.map((value, index) => (
            <View key={index} style={styles.valueCard}>
              <View style={styles.valueIconContainer}>
                <Ionicons name={value.icon} size={28} color="#5D1F1F" />
              </View>
              <Text style={styles.valueTitle}>{value.title}</Text>
              <Text style={styles.valueDescription}>{value.description}</Text>
            </View>
          ))}
        </View>

        {/* Guidelines */}
        {guidelines.map((section, index) => (
          <View key={index} style={styles.guidelinesSection}>
            <Text style={styles.guidelinesTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.guidelineItem}>
                <Text style={styles.guidelineBullet}>•</Text>
                <Text style={styles.guidelineText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Reporting */}
        <View style={styles.reportingSection}>
          <Ionicons name="shield-checkmark" size={32} color="#5D1F1F" />
          <Text style={styles.reportingTitle}>Reporting</Text>
          <Text style={styles.reportingText}>
            If you see content that violates our guidelines, please report it. We review all reports within 24 hours and take action to keep CRWN a safe, welcoming space.
          </Text>
          <Text style={styles.reportingFooter}>
            Zero tolerance for harassment or discrimination.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: c.background },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
    backgroundColor: c.background,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 18, fontFamily: 'Figtree_600SemiBold', color: c.text },
  placeholder: { width: 40 },
  container: { flex: 1, backgroundColor: c.background },
  header: { padding: 20 },
  headerTitle: { fontSize: 24, fontFamily: 'Figtree_700Bold', color: '#5D1F1F', marginBottom: 8 },
  headerDescription: { fontSize: 14, color: c.textSecondary, lineHeight: 20 },
  valuesSection: { paddingHorizontal: 20, paddingTop: 12 },
  valueCard: {
    backgroundColor: c.primaryLight,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  valueIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  valueTitle: { fontSize: 18, fontFamily: 'Figtree_700Bold', color: '#5D1F1F', marginBottom: 6 },
  valueDescription: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
  guidelinesSection: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  guidelinesTitle: { fontSize: 18, fontFamily: 'Figtree_700Bold', color: c.text, marginBottom: 12 },
  guidelineItem: { flexDirection: 'row', marginBottom: 8, paddingRight: 20 },
  guidelineBullet: { fontSize: 16, color: '#5D1F1F', marginRight: 8, fontFamily: 'Figtree_700Bold' },
  guidelineText: { flex: 1, fontSize: 15, color: c.textSecondary, lineHeight: 22 },
  reportingSection: {
    margin: 20, padding: 20,
    backgroundColor: c.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  reportingTitle: { fontSize: 18, fontFamily: 'Figtree_700Bold', color: '#5D1F1F', marginTop: 12, marginBottom: 8 },
  reportingText: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  reportingFooter: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#5D1F1F', textAlign: 'center' },
});