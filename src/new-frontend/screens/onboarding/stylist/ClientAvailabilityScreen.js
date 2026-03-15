import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import SelectOption from '../../../components/ui/SelectOption';

const OPTIONS = [
  'Yes, accepting new clients',
  'Accepting clients by referral only',
  'Currently on a waitlist',
  'Not accepting new clients right now',
];

export default function ClientAvailabilityScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);

  function handleContinue() {
    navigation.navigate('ExperienceLevel', { ...route.params, clientAvailability: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={7}
      title="Are you accepting new clients?"
      subtitle="Set your current availability so your CRWN profile stays accurate."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('ExperienceLevel', route.params)}
      continueDisabled={!selected}
    >
      {OPTIONS.map((opt) => (
        <SelectOption
          key={opt}
          label={opt}
          selected={selected === opt}
          onPress={() => setSelected(opt)}
        />
      ))}
    </OnboardingLayout>
  );
}
