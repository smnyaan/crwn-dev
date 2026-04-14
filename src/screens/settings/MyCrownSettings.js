import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';

const DEFAULTS = {
  affirmationsEnabled: true,
  affirmationFrequency: 'daily',
  languageTone: 'empowering',
  celebrationReminders: true,
};

const frequencyOptions = [
  { value: 'daily', label: 'Daily', icon: 'sunny-outline' },
  { value: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
  { value: 'off', label: 'Off', icon: 'moon-outline' },
];

const toneOptions = [
  { value: 'gentle', label: 'Gentle', description: 'Soft, nurturing encouragement', icon: '🌸' },
  { value: 'empowering', label: 'Empowering', description: 'Confident, strong affirmations', icon: '💪' },
  { value: 'bold', label: 'Bold', description: 'Fierce, unapologetic declarations', icon: '👑' },
];

export default function MyCrownSettings({ onBack }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('crown_prefs')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.crown_prefs) setPrefs({ ...DEFAULTS, ...data.crown_prefs });
        setLoading(false);
      });
  }, [user?.id]);

  const updatePref = (key, value) => {
    setPrefs(prev => {
      const updated = { ...prev, [key]: value };
      scheduleSave(updated);
      return updated;
    });
  };

  const scheduleSave = (updated) => {
    if (!user?.id) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await supabase.from('profiles').update({ crown_prefs: updated }).eq('id', user.id);
      setSaving(false);
    }, 800);
  };

  const affirmationText = {
    gentle: "Your hair is beautiful exactly as it is. You're doing amazing. 🌸",
    empowering: "Your crown is powerful. You're unstoppable. Wear it with pride. 💪",
    bold: "Your hair is revolutionary. Your existence is resistance. Own it. 👑",
  };

  return (
    <View style={styles.fullContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5D1F1F" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>My Crown 👑</Text>
        <View style={styles.statusArea}>
          {saving && <ActivityIndicator size="small" color="#5D1F1F" />}
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#5D1F1F" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.crown}>👑</Text>
            <Text style={styles.headerTitle}>Your Crown, Your Way</Text>
            <Text style={styles.headerDescription}>
              Personalize your daily affirmations and celebrations. CRWN is here to uplift you.
            </Text>
          </View>

          {/* Affirmations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Affirmations</Text>

            <View style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Enable Affirmations</Text>
                <Text style={styles.optionDescription}>Receive daily reminders that you're worthy</Text>
              </View>
              <Switch
                value={prefs.affirmationsEnabled}
                onValueChange={(v) => updatePref('affirmationsEnabled', v)}
                trackColor={{ false: '#d1d5db', true: '#5D1F1F' }}
                thumbColor="#fff"
              />
            </View>

            {prefs.affirmationsEnabled && (
              <>
                <Text style={styles.subSectionTitle}>Frequency</Text>
                <View style={styles.buttonGroup}>
                  {frequencyOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.frequencyButton,
                        prefs.affirmationFrequency === option.value && styles.frequencyButtonActive,
                      ]}
                      onPress={() => updatePref('affirmationFrequency', option.value)}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={prefs.affirmationFrequency === option.value ? '#5D1F1F' : '#6b7280'}
                      />
                      <Text style={[
                        styles.frequencyText,
                        prefs.affirmationFrequency === option.value && styles.frequencyTextActive,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Language Tone */}
          {prefs.affirmationsEnabled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Language Tone</Text>
              <Text style={styles.sectionDescription}>
                Choose how we speak to you. Your crown, your voice.
              </Text>

              {toneOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.toneOption,
                    prefs.languageTone === option.value && styles.toneOptionActive,
                  ]}
                  onPress={() => updatePref('languageTone', option.value)}
                >
                  <Text style={styles.toneIcon}>{option.icon}</Text>
                  <View style={styles.toneContent}>
                    <Text style={[
                      styles.toneLabel,
                      prefs.languageTone === option.value && styles.toneLabelActive,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.toneDescription}>{option.description}</Text>
                  </View>
                  {prefs.languageTone === option.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#5D1F1F" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Celebrations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Celebration Reminders</Text>
            <View style={styles.option}>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Personal Milestones</Text>
                <Text style={styles.optionDescription}>
                  Wash day anniversaries, big chop celebrations, and more
                </Text>
              </View>
              <Switch
                value={prefs.celebrationReminders}
                onValueChange={(v) => updatePref('celebrationReminders', v)}
                trackColor={{ false: '#d1d5db', true: '#5D1F1F' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Example Affirmation */}
          {prefs.affirmationsEnabled && (
            <View style={styles.exampleCard}>
              <Ionicons name="sparkles" size={24} color="#5D1F1F" />
              <Text style={styles.exampleTitle}>Example Affirmation</Text>
              <Text style={styles.exampleText}>
                {affirmationText[prefs.languageTone] ?? affirmationText.empowering}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#FDF9F0' },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#FDF9F0',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 18, fontFamily: 'Figtree_600SemiBold', color: '#111827' },
  statusArea: { width: 40, alignItems: 'center' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#FDF9F0' },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  crown: { fontSize: 48, marginBottom: 8 },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Figtree_700Bold',
    color: '#5D1F1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20, textAlign: 'center' },
  section: { marginTop: 24, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionDescription: { fontSize: 13, color: '#6b7280', paddingHorizontal: 20, marginBottom: 12, lineHeight: 18 },
  subSectionTitle: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: '#111827',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  optionContent: { flex: 1, marginRight: 16 },
  optionLabel: { fontSize: 16, fontFamily: 'Figtree_500Medium', color: '#111827', marginBottom: 2 },
  optionDescription: { fontSize: 13, color: '#6b7280' },
  buttonGroup: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  frequencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FCFCFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  frequencyButtonActive: { backgroundColor: '#fef2f2', borderColor: '#5D1F1F' },
  frequencyText: { fontSize: 14, color: '#6b7280', fontFamily: 'Figtree_500Medium' },
  frequencyTextActive: { color: '#5D1F1F', fontFamily: 'Figtree_600SemiBold' },
  toneOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 12 },
  toneOptionActive: { backgroundColor: '#fef2f2' },
  toneIcon: { fontSize: 32 },
  toneContent: { flex: 1 },
  toneLabel: { fontSize: 16, fontFamily: 'Figtree_500Medium', color: '#111827', marginBottom: 2 },
  toneLabelActive: { color: '#5D1F1F', fontFamily: 'Figtree_600SemiBold' },
  toneDescription: { fontSize: 13, color: '#6b7280' },
  exampleCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  exampleTitle: {
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
    color: '#5D1F1F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 8,
  },
  exampleText: { fontSize: 15, color: '#111827', textAlign: 'center', lineHeight: 22 },
});
