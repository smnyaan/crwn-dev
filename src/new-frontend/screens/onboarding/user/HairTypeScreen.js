import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import DescriptiveOption from '../../../components/ui/DescriptiveOption';

const HAIR_TYPES = [
  { id: 'straight', label: 'Straight', description: 'smooth strands with no natural curl pattern' },
  { id: 'wavy', label: 'Wavy', description: 'loose, beach waves. not straight, not curly' },
  { id: 'curly', label: 'Curly', description: 'springy curls from loose loops to corkscrews' },
  { id: 'coily', label: 'Coily', description: 'dense, tightly coiled or kinky hair' },
];

export default function HairTypeScreen({ navigation, route }) {
  const [selected, setSelected] = useState([]);

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleContinue() {
    navigation.navigate('HairPorosity', { ...route.params, hairTypes: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={5}
      title="What is your hair type?"
      subtitle="Select all that apply. Curl patterns can be complex and that's the point."
      onContinue={handleContinue}
      continueDisabled={selected.length === 0}
    >
      {HAIR_TYPES.map((type) => (
        <DescriptiveOption
          key={type.id}
          label={type.label}
          description={type.description}
          selected={selected.includes(type.id)}
          onPress={() => toggle(type.id)}
        />
      ))}
    </OnboardingLayout>
  );
}
