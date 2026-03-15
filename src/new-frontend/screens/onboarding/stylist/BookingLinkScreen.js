import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import OnboardingInput from '../../../components/ui/OnboardingInput';

export default function BookingLinkScreen({ navigation, route }) {
  const [bookingLink, setBookingLink] = useState('');

  function handleContinue() {
    navigation.navigate('Portfolio', { ...route.params, bookingLink });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={10}
      title="Make it easy to book with you."
      subtitle="Add a link so clients can go straight from your profile to your calendar."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('Portfolio', route.params)}
    >
      <OnboardingInput
        label="Booking Link"
        placeholder="https://"
        value={bookingLink}
        onChangeText={setBookingLink}
        keyboardType="url"
        autoCapitalize="none"
      />
    </OnboardingLayout>
  );
}
