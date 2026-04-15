import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { lightTheme, darkTheme } from '../theme/themes';

const ThemeContext = createContext({
  isDark: false,
  setDarkMode: () => {},
  colors: lightTheme,
});

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const saveTimer = useRef(null);

  // Load persisted preference when user is available
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.preferences?.darkMode !== undefined) {
          setIsDark(!!data.preferences.darkMode);
        }
      });
  }, [user?.id]);

  const setDarkMode = (value) => {
    setIsDark(value);
    if (!user?.id) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();
      const merged = { ...(data?.preferences ?? {}), darkMode: value };
      await supabase.from('profiles').update({ preferences: merged }).eq('id', user.id);
    }, 500);
  };

  return (
    <ThemeContext.Provider value={{ isDark, setDarkMode, colors: isDark ? darkTheme : lightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
