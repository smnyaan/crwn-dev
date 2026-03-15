import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import OnboardingInput from '../../../components/ui/OnboardingInput';

export default function UsernameScreen({ navigation, route }) {
  const [username, setUsername] = useState('');

  function handleContinue() {
    navigation.navigate('UsageGoals', { ...route.params, username });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={3}
      title="Choose your username"
      subtitle="Your username will be visible to the CRWN community."
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
