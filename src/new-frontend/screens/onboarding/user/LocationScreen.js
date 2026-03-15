import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import OnboardingInput from '../../../components/ui/OnboardingInput';

export default function LocationScreen({ navigation, route }) {
  const [location, setLocation] = useState('');

  function handleContinue() {
    navigation.navigate('Notifications', { ...route.params, location });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={12}
      title="Where are you based?"
      subtitle="This helps us connect you with stylists and creators near you."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('Notifications', route.params)}
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
