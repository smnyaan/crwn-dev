import React, { createContext, useContext, useState } from 'react';
import { Modal, View } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from './ThemeContext';

const ProfileNavContext = createContext({
  openProfile: () => {},
  closeProfile: () => {},
});

/**
 * Wrap your authenticated app in this.
 *
 * Usage from any component:
 *   const { openProfile } = useProfileNav();
 *   <TouchableOpacity onPress={() => openProfile(someUserId)}>...</TouchableOpacity>
 *
 * That slides up a full-screen ProfileScreen with a back button.
 * No navigation package required.
 */
export function ProfileNavProvider({ children }) {
  const [stack, setStack] = useState([]); // supports nested profiles
  const { colors } = useTheme();

  const openProfile  = (userId) => setStack((s) => [...s, userId]);
  const closeProfile = ()       => setStack((s) => s.slice(0, -1));

  const currentUserId = stack[stack.length - 1] ?? null;

  return (
    <ProfileNavContext.Provider value={{ openProfile, closeProfile }}>
      {children}

      <Modal
        visible={!!currentUserId}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeProfile}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ProfileScreen
            viewedUserId={currentUserId}
            onBack={closeProfile}
          />
        </View>
      </Modal>
    </ProfileNavContext.Provider>
  );
}

export const useProfileNav = () => useContext(ProfileNavContext);