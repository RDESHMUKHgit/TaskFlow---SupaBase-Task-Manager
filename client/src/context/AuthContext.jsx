import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch or sync public profile
  const fetchProfile = useCallback(async (userId, userEmail, userMeta) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
      } else {
        // Fallback to auth metadata if profile query fails
        setProfile({
          id: userId,
          email: userEmail,
          full_name: userMeta?.full_name || userMeta?.name || userEmail?.split('@')[0] || 'User',
          avatar_url: userMeta?.avatar_url || '',
        });
      }
    } catch (err) {
      console.warn('Profile fetch warning:', err.message);
      setProfile({
        id: userId,
        email: userEmail,
        full_name: userMeta?.full_name || userMeta?.name || userEmail?.split('@')[0] || 'User',
        avatar_url: '',
      });
    }
  }, []);

  // Initialize Auth state & Listen to auth events
  useEffect(() => {
    let mounted = true;

    // Get current session on load
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(
              initialSession.user.id,
              initialSession.user.email,
              initialSession.user.user_metadata
            );
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, USER_UPDATED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(
            currentSession.user.id,
            currentSession.user.email,
            currentSession.user.user_metadata
          );
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign Up with Email, Password & Full Name
  const signUp = async ({ email, password, fullName }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign In with Email and Password
  const signIn = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsProfileModalOpen(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update user profile (Full Name & Avatar URL)
  const updateUserProfile = async ({ fullName, avatarUrl }) => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      const updateData = {};
      if (fullName !== undefined) updateData.full_name = fullName;
      if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
      updateData.updated_at = new Date().toISOString();

      // 1. Update in public.users table
      const { error: dbError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (dbError) throw dbError;

      // 2. Update Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName !== undefined ? fullName : profile?.full_name,
          avatar_url: avatarUrl !== undefined ? avatarUrl : profile?.avatar_url,
        },
      });

      if (authError) console.warn('Auth metadata update note:', authError.message);

      // 3. Update local state
      setProfile((prev) => ({
        ...prev,
        ...updateData,
      }));

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    isProfileModalOpen,
    openProfileModal,
    closeProfileModal,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
