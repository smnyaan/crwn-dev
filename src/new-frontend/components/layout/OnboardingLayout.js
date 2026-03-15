import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../ui/ProgressBar';
import ContinueButton from '../ui/ContinueButton';
import SkipLink from '../ui/SkipLink';

// Wraps every onboarding step: safe area + progress bar + scrollable content + sticky bottom button.
export default function OnboardingLayout({
  children,
  totalSteps,
  currentStep,
  title,
  subtitle,
  onContinue,
  continueLabel = 'Continue',
  onSkip,
  continueDisabled,
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ProgressBar totalSteps={totalSteps} currentStep={currentStep} />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}

          <View style={styles.content}>{children}</View>
        </ScrollView>

        <View style={styles.footer}>
          {onSkip && <SkipLink onPress={onSkip} />}
          <ContinueButton
            label={continueLabel}
            onPress={onContinue}
            disabled={continueDisabled}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F6F3EF',
  },
  flex: {
    flex: 1,
  },
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
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#52463C',
    marginBottom: 28,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#F6F3EF',
  },
});
