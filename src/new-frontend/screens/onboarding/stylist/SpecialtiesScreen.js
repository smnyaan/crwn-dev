import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import MultiSelectOption from '../../../components/ui/MultiSelectOption';

const OPTIONS = [
  'Locs & loc maintenance',
  'Box braids & protective styles',
  'Silk press & blowouts',
  'Natural styles & wash & go',
  'Twists & twist outs',
  'Wigs & installs',
  'Color & highlights',
];

export default function SpecialtiesScreen({ navigation, route }) {
  const [selected, setSelected] = useState([]);

  function toggle(opt) {
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  }

  function handleContinue() {
    navigation.navigate('BookingLink', { ...route.params, specialties: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={9}
      title="What do you specialize in?"
      subtitle="Select the styles and techniques that define your work."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('BookingLink', route.params)}
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
