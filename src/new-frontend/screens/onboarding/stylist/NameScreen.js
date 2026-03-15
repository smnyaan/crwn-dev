import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import OnboardingInput from '../../../components/ui/OnboardingInput';

export default function StylistNameScreen({ navigation, route }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function handleContinue() {
    navigation.navigate('StylistUsername', { ...route.params, firstName, lastName });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={2}
      title="What's your name?"
      subtitle="This helps us personalize your experience."
      onContinue={handleContinue}
      continueDisabled={!firstName.trim() || !lastName.trim()}
    >
      <OnboardingInput
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
      <OnboardingInput
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
    </OnboardingLayout>
  );
}
