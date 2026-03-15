import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import OnboardingInput from '../../../components/ui/OnboardingInput';

export default function BusinessNameScreen({ navigation, route }) {
  const [businessName, setBusinessName] = useState('');

  function handleContinue() {
    navigation.navigate('WorkLocation', { ...route.params, businessName });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={4}
      title="What is your business called?"
      subtitle="Add your salon or brand name so clients can find and recognize you."
      onContinue={handleContinue}
      continueDisabled={!businessName.trim()}
    >
      <OnboardingInput
        label="Name"
        placeholder="@"
        value={businessName}
        onChangeText={setBusinessName}
        autoCapitalize="words"
      />
    </OnboardingLayout>
  );
}
