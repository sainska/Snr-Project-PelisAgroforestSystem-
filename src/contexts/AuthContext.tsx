
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import type { Profile, AuthContextType } from "@/types/auth";

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle session initialization and changes
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (mounted) {
        setSession(session);
        setUser(session?.user || null);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile when session changes
  useEffect(() => {
    let mounted = true;

    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            name,
            email,
            phone,
            location,
            avatar_url,
            id_document_url,
            face_photo_url,
            created_at
          `)
          .eq("id", session.user.id)
          .single();

        if (!mounted) return;

        if (error) {
          setError(`Error fetching profile: ${error.message}`);
          setProfile(null);
        } else {
          // Set default values for missing fields
          const profileWithDefaults: Profile = {
            ...data,
            national_id: data.national_id || '',
            role: 'Community Member', // Default role
            farm_group_id: data.farm_group_id || null,
            face_verified: false,
            email_verified: true, // Assume verified if they can log in
            payment_verified: false,
            account_approved: false,
            approved_by: null,
            approved_at: null,
            trust_score: 0,
            updated_at: new Date().toISOString(),
          };
          setProfile(profileWithDefaults);
        }
      } catch (err) {
        if (mounted) {
          setError(`Unexpected error: ${err}`);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => { mounted = false; };
  }, [session]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(`Error refreshing profile: ${err}`);
    }
  };

  const checkAccountStatus = async () => {
    return authService.checkAccountStatus(user, profile);
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    session,
    isLoading: loading,
    signUp: authService.signUp,
    signIn: authService.signIn,
    signOut,
    resetPassword: authService.resetPassword,
    updateProfile: (data) => authService.updateProfile(data, user?.id || '', setProfile),
    uploadDocument: (file, type) => authService.uploadDocument(file, type, user?.id || ''),
    submitPayment: (mpesaCode, phoneNumber) => authService.submitPayment(mpesaCode, phoneNumber, user?.id || ''),
    checkAccountStatus,
    loading,
    error,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};