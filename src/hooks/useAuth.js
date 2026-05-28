import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { profileService } from '../services/profileService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const refreshProfile = useCallback(async (userId) => {
    if (!userId) return;
    const { data } = await profileService.getProfile(userId);
    if (data) setProfile(data);
    setProfileLoaded(true);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user?.id) refreshProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user?.id) refreshProfile(session.user.id);
        if (!session) { setProfile(null); setProfileLoaded(false); }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Keep the cached profile in sync when the user edits their own profile
  // from any screen (EditProfile, settings, etc.)
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`profile-self:${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new) setProfile(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // Sign up function
  const signUp = useCallback(async (email, password, userData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { user: null, error: authError };
      }

      if (!authData.user) {
        return { user: null, error: new Error('No user returned') };
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: email,
          username: userData.username || email.split('@')[0],
          full_name: userData.name || '',
          is_stylist: userData.userType === 'stylist',
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error };
      }

      return { user: data?.user, session: data?.session, error: null };
    } catch (error) {
      return { user: null, session: null, error };
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setProfileLoaded(false);
  }, []);

  const value = {
    user,
    session,
    loading,
    profile,
    profileLoaded,
    refreshProfile,
    signUp,
    signIn,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};