import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import SelectOption from '../../../components/ui/SelectOption';

const OPTIONS = [
  'Retain length & grow my hair',
  'Find products that actually work',
  'Master my wash day routine',
  'Explore new styles',
  'Heal and repair my hair',
  'Understand my hair better',
];

export default function HairGoalScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);

  function handleContinue() {
    navigation.navigate('Styles', { ...route.params, hairGoal: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={9}
      title="What's your main hair goal right now?"
      subtitle="This helps us show you content that actually moves the needle."
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
