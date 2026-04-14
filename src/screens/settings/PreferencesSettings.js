import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';

const HAIR_TYPES = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C'];
const POROSITY_OPTIONS = ['Low', 'Medium', 'High', "I don't know"];
const CONTENT_OPTIONS = ['Tutorials', 'Inspiration', 'Product Reviews', 'Community', 'All'];

export default function PreferencesSettings({ onBack }) {
  const { user } = useAuth();

  const [hairType, setHairType] = useState(null);
  const [porosity, setPorosity] = useState(null);
  const [contentFocus, setContentFocus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Picker modals
  const [hairTypePicker, setHairTypePicker] = useState(false);
  const [porosityPicker, setPorosityPicker] = useState(false);
  const [contentPicker, setContentPicker] = useState(false);

  // Load existing data
  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      supabase.from('hair_profiles').select('hair_type, porosity').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('preferences').eq('id', user.id).single(),
    ]).then(([hairRes, profRes]) => {
      if (hairRes.data) {
        setHairType(hairRes.data.hair_type ?? null);
        setPorosity(hairRes.data.porosity ?? null);
      }
      if (profRes.data?.preferences) {
        setContentFocus(profRes.data.preferences.contentFocus ?? null);
      }
      setLoading(false);
    });
  }, [user?.id]);

  const saveHairProfile = async (updates) => {
    setSaving(true);
    const { data: existing } = await supabase
      .from('hair_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('hair_profiles').update(updates).eq('user_id', user.id);
    } else {
      await supabase.from('hair_profiles').insert({ ...updates, user_id: user.id });
    }
    setSaving(false);
  };

  const savePreferences = async (updates) => {
    setSaving(true);
    const { data } = await supabase.from('profiles').select('preferences').eq('id', user.id).single();
    const merged = { ...(data?.preferences ?? {}), ...updates };
    await supabase.from('profiles').update({ preferences: merged }).eq('id', user.id);
    setSaving(false);
  };

  const handleHairTypeSelect = (value) => {
    setHairType(value);
    setHairTypePicker(false);
    saveHairProfile({ hair_type: value });
  };

  const handlePorositySelect = (value) => {
    setPorosity(value);
    setPorosityPicker(false);
    saveHairProfile({ porosity: value });
  };

  const handleContentSelect = (value) => {
    setContentFocus(value);
    setContentPicker(false);
    savePreferences({ contentFocus: value });
  };

  return (
    <View style={styles.fullContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5D1F1F" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Preferences</Text>
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
          {/* Hair Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hair Profile</Text>

            <TouchableOpacity style={styles.option} onPress={() => setHairTypePicker(true)}>
              <Text style={styles.optionLabel}>Hair Type</Text>
              <View style={styles.optionValue}>
                <Text style={styles.valueText}>{hairType ?? 'Not set'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => setPorosityPicker(true)}>
              <Text style={styles.optionLabel}>Porosity</Text>
              <View style={styles.optionValue}>
                <Text style={styles.valueText}>{porosity ?? 'Not set'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Content Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Preferences</Text>
            <TouchableOpacity style={styles.option} onPress={() => setContentPicker(true)}>
              <Text style={styles.optionLabel}>Content Focus</Text>
              <View style={styles.optionValue}>
                <Text style={styles.valueText}>{contentFocus ?? 'Not set'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Hair Type Picker */}
      <PickerModal
        visible={hairTypePicker}
        title="Select Hair Type"
        options={HAIR_TYPES}
        selected={hairType}
        onSelect={handleHairTypeSelect}
        onClose={() => setHairTypePicker(false)}
      />

      {/* Porosity Picker */}
      <PickerModal
        visible={porosityPicker}
        title="Select Porosity"
        options={POROSITY_OPTIONS}
        selected={porosity}
        onSelect={handlePorositySelect}
        onClose={() => setPorosityPicker(false)}
      />

      {/* Content Focus Picker */}
      <PickerModal
        visible={contentPicker}
        title="Content Focus"
        options={CONTENT_OPTIONS}
        selected={contentFocus}
        onSelect={handleContentSelect}
        onClose={() => setContentPicker(false)}
      />
    </View>
  );
}

function PickerModal({ visible, title, options, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={pickerStyles.overlay}>
        <View style={pickerStyles.sheet}>
          <View style={pickerStyles.handle} />
          <Text style={pickerStyles.title}>{title}</Text>
          <ScrollView>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={pickerStyles.item}
                onPress={() => onSelect(opt)}
              >
                <Text style={[pickerStyles.itemText, selected === opt && pickerStyles.itemTextActive]}>
                  {opt}
                </Text>
                {selected === opt && (
                  <Ionicons name="checkmark" size={20} color="#5D1F1F" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={pickerStyles.cancelBtn} onPress={onClose}>
            <Text style={pickerStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  section: { marginTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionLabel: { fontSize: 16, color: '#111827' },
  optionValue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valueText: { fontSize: 15, color: '#6b7280' },
});

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  itemText: { fontSize: 16, color: '#374151' },
  itemTextActive: { color: '#5D1F1F', fontFamily: 'Figtree_600SemiBold' },
  cancelBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: '#6b7280', fontFamily: 'Figtree_500Medium' },
});
