import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import ProgressBar from '../../components/ui/ProgressBar';
import ContinueButton from '../../components/ui/ContinueButton';
import { supabase } from '../../../config/supabase';

const CODE_LENGTH = 6;

export default function VerifyCodeScreen({ navigation, route }) {
  const { role, phone } = route.params;
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  function handleDigit(text, index) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError('');
    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleBackspace(index) {
    if (code[index]) {
      const next = [...code];
      next[index] = '';
      setCode(next);
    } else if (index > 0) {
      inputs.current[index - 1]?.focus();
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
    }
  }

  async function handleVerify() {
    setError('');
    setLoading(true);
    const token = code.join('');
    const { error: err } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    setLoading(false);
    if (err) {
      setError('Invalid code. Please try again.');
      setCode(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
      return;
    }
    // Navigate based on role
    if (role === 'stylist') {
      navigation.navigate('StylistName', { role });
    } else {
      navigation.navigate('UserName', { role });
    }
  }

  async function handleResend() {
    await supabase.auth.signInWithOtp({ phone });
    setResendCooldown(30);
    setCode(Array(CODE_LENGTH).fill(''));
    setError('');
    inputs.current[0]?.focus();
  }

  const isFull = code.every(Boolean);
  const display = phone.replace('+1', '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ProgressBar totalSteps={12} currentStep={1} />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Enter your code</Text>
          <Text style={styles.subtitle}>
            We texted a 6-digit code to {display}
          </Text>

          <View style={styles.codeRow}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => (inputs.current[i] = r)}
                style={[styles.codeBox, digit && styles.codeBoxFilled]}
                value={digit}
                onChangeText={(t) => handleDigit(t, i)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') handleBackspace(i);
                }}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? <ActivityIndicator color="#BF9466" style={styles.loader} /> : null}

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't get it? </Text>
            {resendCooldown > 0 ? (
              <Text style={styles.resendDisabled}>Resend in {resendCooldown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.changePhone}
          >
            <Text style={styles.changePhoneText}>Change phone number</Text>
          </TouchableOpacity>
        </ScrollView>

        <ContinueButton
          label="Verify"
          onPress={handleVerify}
          disabled={!isFull || loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F3EF' },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 28,
    color: '#251C15',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#52463C',
    marginBottom: 40,
    lineHeight: 22,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeBox: {
    width: 48,
    height: 58,
    borderWidth: 1.5,
    borderColor: '#D4C8B8',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Figtree-SemiBold',
    color: '#251C15',
    backgroundColor: '#FFFFFF',
  },
  codeBoxFilled: {
    borderColor: '#BF9466',
  },
  error: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#9B2C2C',
    textAlign: 'center',
    marginBottom: 12,
  },
  loader: { marginVertical: 8 },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  resendLabel: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#52463C',
  },
  resendDisabled: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#A89880',
  },
  resendLink: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#251C15',
    textDecorationLine: 'underline',
  },
  changePhone: {
    alignItems: 'center',
    marginTop: 16,
  },
  changePhoneText: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#7A6E65',
    textDecorationLine: 'underline',
  },
});
