import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import OnboardingLayout from '../../components/layout/OnboardingLayout';
import { supabase } from '../../../config/supabase';

export default function PhoneScreen({ navigation, route }) {
  const role = route?.params?.role || 'user';
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format as user types: (555) 555-5555
  function formatPhone(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Convert display format to E.164 for Supabase
  function toE164(display) {
    const digits = display.replace(/\D/g, '');
    return `+1${digits}`; // US only — extend for international later
  }

  async function handleContinue() {
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: toE164(phone),
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigation.navigate('VerifyCode', { role, phone: toE164(phone) });
  }

  const digits = phone.replace(/\D/g, '');

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={1}
      title="What's your phone number?"
      subtitle="We'll send you a quick verification code. No spam, ever."
      onContinue={handleContinue}
      continueDisabled={digits.length < 10 || loading}
    >
      <Text style={styles.label}>Phone number</Text>
      <View style={styles.inputRow}>
        <View style={styles.flagBox}>
          <Text style={styles.flag}>🇺🇸 +1</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="(555) 555-5555"
          placeholderTextColor="#A89880"
          value={phone}
          onChangeText={(t) => setPhone(formatPhone(t))}
          keyboardType="phone-pad"
          maxLength={14}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator style={styles.loader} color="#BF9466" /> : null}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#3D3229',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D4C8B8',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  flagBox: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#D4C8B8',
    justifyContent: 'center',
  },
  flag: {
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#251C15',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#251C15',
  },
  error: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#9B2C2C',
    marginTop: 8,
  },
  loader: {
    marginTop: 16,
  },
});
