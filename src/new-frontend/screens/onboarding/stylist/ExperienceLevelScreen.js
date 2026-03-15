import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import SelectOption from '../../../components/ui/SelectOption';

const OPTIONS = [
  'Just starting out (0–2 years)',
  'Getting established (3–5 years)',
  'Seasoned stylist (6–10 years)',
  'Industry veteran (10+ years)',
];

export default function ExperienceLevelScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);

  function handleContinue() {
    navigation.navigate('Specialties', { ...route.params, experienceLevel: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={8}
      title="How long have you been doing this?"
      subtitle="Your experience helps clients find the right fit."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('Specialties', route.params)}
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
