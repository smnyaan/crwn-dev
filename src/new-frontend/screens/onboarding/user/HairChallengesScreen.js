import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import MultiSelectOption from '../../../components/ui/MultiSelectOption';

const OPTIONS = [
  'Dryness & moisture retention',
  'Breakage & damage',
  'Shrinkage',
  'Scalp health',
  'Frizz',
  'Slow growth / length retention',
  'Transitioning damage',
  'Heat damage',
];

export default function HairChallengesScreen({ navigation, route }) {
  const [selected, setSelected] = useState([]);

  function toggle(opt) {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  }

  function handleContinue() {
    navigation.navigate('HairGoal', { ...route.params, hairChallenges: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={8}
      title="What are you working through?"
      subtitle="Select all that apply, we'll tailor your feed around what matters most."
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
