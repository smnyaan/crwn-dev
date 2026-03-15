import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import SelectOption from '../../../components/ui/SelectOption';

const OPTIONS = [
  'Independent / Freelance',
  'Salon-based',
  'Mobile stylist (I come to you)',
  'Suite / Studio rental',
];

export default function WorkStyleScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);

  function handleContinue() {
    navigation.navigate('ClientAvailability', { ...route.params, workStyle: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={6}
      title="How do you work?"
      subtitle="Tell us about your setup so clients know what to expect."
      onContinue={handleContinue}
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
