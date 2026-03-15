import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import OnboardingInput from '../../../components/ui/OnboardingInput';

export default function WorkLocationScreen({ navigation, route }) {
  const [location, setLocation] = useState('');

  function handleContinue() {
    navigation.navigate('WorkStyle', { ...route.params, workLocation: location });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={5}
      title="Where do you work?"
      subtitle="Let clients know where they can find you."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('WorkStyle', route.params)}
    >
      <OnboardingInput
        label="City, State"
        placeholder="e.g. Los Angeles, CA"
        value={location}
        onChangeText={setLocation}
        autoCapitalize="words"
      />
    </OnboardingLayout>
  );
}
