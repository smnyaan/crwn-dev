import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import MultiSelectOption from '../../../components/ui/MultiSelectOption';

const OPTIONS = [
  'Learn what works for my hair',
  'Document and track my journey',
  'Discover products for my hair type',
  'Get inspired by styles and looks',
  'Find and connect with stylists',
  'Share my journey with others',
];

export default function UsageGoalsScreen({ navigation, route }) {
  const [selected, setSelected] = useState([]);

  function toggle(opt) {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  }

  function handleContinue() {
    navigation.navigate('HairType', { ...route.params, usageGoals: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={4}
      title="How do you want to use CRWN?"
      subtitle="Select everything that applies, we'll personalize your experience around it."
      onContinue={handleContinue}
      continueDisabled={selected.length === 0}
    >
      {OPTIONS.map((opt) => (
        <MultiSelectOption
          key={opt}
          label={opt}
          selected={selected.includes(opt)}
          onPress={() => toggle(opt)}
        />
      ))}
    </OnboardingLayout>
  );
}
