import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import NotificationToggleRow from '../../../components/ui/NotificationToggleRow';

// Stylist notifications — fewer options than user version.
const NOTIFICATIONS = [
  {
    id: 'new_posts',
    icon: '🔔',
    label: 'New posts from people I follow',
    description: "See fresh content as soon as it's posted.",
    defaultOn: true,
  },
  {
    id: 'stylist_recs',
    icon: '✦',
    label: 'Stylist recommendations near me',
    description: 'Get matched with stylists in your area.',
    defaultOn: true,
  },
  {
    id: 'engagement',
    icon: '💬',
    label: 'Comments & likes on my posts',
    description: 'Know when the community engages with your content.',
    defaultOn: true,
  },
];

export default function StylistNotificationsScreen({ navigation, route }) {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultOn]))
  );

  function handleContinue() {
    navigation.navigate('DiscoverStylists', { ...route.params, notificationPrefs: prefs });
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={13}
      title="Stay in the loop!"
      subtitle="We'll only notify you about things that matter to your hair journey."
      onContinue={handleContinue}
    >
      {NOTIFICATIONS.map((n) => (
        <NotificationToggleRow
          key={n.id}
          icon={n.icon}
          label={n.label}
          description={n.description}
          value={prefs[n.id]}
          onValueChange={(val) => setPrefs((p) => ({ ...p, [n.id]: val }))}
        />
      ))}
    </OnboardingLayout>
  );
}
