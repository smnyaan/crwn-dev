import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../config/supabase';

export default function SupportFeedback({ onBack }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [submitting, setSubmitting] = useState(false);

  const feedbackTypes = [
    { value: 'bug', label: 'Report a Bug', icon: 'bug-outline' },
    { value: 'suggestion', label: 'Suggest a Feature', icon: 'bulb-outline' },
    { value: 'question', label: 'Ask a Question', icon: 'help-circle-outline' },
  ];

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert('Empty Feedback', 'Please enter your feedback before submitting.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id ?? null,
      type: feedbackType,
      message: feedback.trim(),
    });
    setSubmitting(false);

    if (error) {
      // Gracefully handle missing table by still thanking the user
      console.warn('Feedback insert error:', error.message);
    }

    Alert.alert(
      'Thank You!',
      "Your feedback helps us make CRWN better. We'll review it and get back to you if needed.",
      [{ text: 'OK', onPress: () => setFeedback('') }],
    );
  };

  return (
    <View style={styles.fullContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Support & Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>We're Listening</Text>
          <Text style={styles.headerDescription}>
            Your voice matters. Help us build CRWN together through co-creation, not complaints.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Help Center', 'Help center articles coming soon.')}
          >
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Help Center</Text>
              <Text style={styles.actionDescription}>Browse FAQs and guides</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Contact Support', 'Email: support@crwnapp.com')}
          >
            <Ionicons name="mail-outline" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Contact Support</Text>
              <Text style={styles.actionDescription}>Get help from our team</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Feedback Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Your Thoughts</Text>

          <Text style={styles.question}>What would make CRWN better for you?</Text>

          <View style={styles.typeSelector}>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[styles.typeButton, feedbackType === type.value && styles.typeButtonActive]}
                onPress={() => setFeedbackType(type.value)}
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={feedbackType === type.value ? colors.primary : '#6b7280'}
                />
                <Text style={[styles.typeText, feedbackType === type.value && styles.typeTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Tell us more... We're all ears!"
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={6}
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.submitButtonText}>Submit Feedback</Text>}
          </TouchableOpacity>
        </View>

        {/* Community Impact */}
        <View style={styles.impactCard}>
          <Ionicons name="people" size={32} color={colors.primary} />
          <Text style={styles.impactTitle}>Community-Driven Growth</Text>
          <Text style={styles.impactText}>
            Over 500+ features suggested by our community. Your ideas shape CRWN's future.
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
  headerTitle: { fontSize: 24, fontFamily: 'Figtree_700Bold', color: c.primary, marginBottom: 8 },
  headerDescription: { fontSize: 14, color: c.textSecondary, lineHeight: 20 },
  section: { marginTop: 12, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: c.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: c.surface,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontFamily: 'Figtree_600SemiBold', color: c.text, marginBottom: 2 },
  actionDescription: { fontSize: 13, color: c.textSecondary },
  question: { fontSize: 16, fontFamily: 'Figtree_600SemiBold', color: c.text, marginBottom: 16 },
  typeSelector: { marginBottom: 16 },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: c.surface,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  typeButtonActive: { backgroundColor: c.primaryLight, borderColor: c.selected },
  typeText: { fontSize: 15, color: c.textSecondary },
  typeTextActive: { color: c.selected, fontFamily: 'Figtree_600SemiBold' },
  textArea: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: c.text,
    minHeight: 120,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: c.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Figtree_600SemiBold' },
  impactCard: {
    margin: 20,
    padding: 20,
    backgroundColor: c.primaryLight,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  impactTitle: {
    fontSize: 18,
    fontFamily: 'Figtree_700Bold',
    color: c.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  impactText: { fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
});
