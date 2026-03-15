import React, { useState } from 'react';
import OnboardingLayout from '../../components/layout/OnboardingLayout';
import OnboardingInput from '../../components/ui/OnboardingInput';

export default function EmailScreen({ navigation, route }) {
  const role = route?.params?.role || 'user';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function handleContinue() {
    navigation.navigate('VerifyEmail', { role, firstName, lastName });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={1}
      title="What's your email?"
      subtitle="Join the community. Create an account or sign in to continue."
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
