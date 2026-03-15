import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import OnboardingInput from '../../../components/ui/OnboardingInput';

export default function StylistBioScreen({ navigation, route }) {
  const [bio, setBio] = useState('');

  function handleContinue() {
    navigation.navigate('StylistNotifications', { ...route.params, bio });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={12}
      title="Add a Bio!"
      subtitle="Tell us a little about yourself. A short bio helps others connect with you. You can always update this later."
      onContinue={handleContinue}
    >
      <OnboardingInput
        label="Add Bio:"
        placeholder="..."
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        autoCapitalize="sentences"
      />
    </OnboardingLayout>
  );
}
