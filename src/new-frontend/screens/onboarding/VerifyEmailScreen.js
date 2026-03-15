import React, { useState } from 'react';
import OnboardingLayout from '../../components/layout/OnboardingLayout';
import OnboardingInput from '../../components/ui/OnboardingInput';

export default function VerifyEmailScreen({ navigation, route }) {
  const { role } = route?.params || {};
  const [username, setUsername] = useState('');

  function handleContinue() {
    if (role === 'stylist') {
      navigation.navigate('StylistName', { ...route.params, username });
    } else {
      navigation.navigate('UserName', { ...route.params, username });
    }
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={1}
      title="Verify your email"
      subtitle="Check your inbox, we sent a verification link to [email]! Tap it to continue."
      onContinue={handleContinue}
      continueDisabled={!username.trim()}
    >
      <OnboardingInput
        label="Username"
        placeholder="@"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
    </OnboardingLayout>
  );
}
