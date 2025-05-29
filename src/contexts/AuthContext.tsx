
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
            national_id,
            role,
            farm_group_id,
            face_verified,
            email_verified,
            payment_verified,
            account_approved,
            approved_by,
            approved_at,
            trust_score,
            created_at,
            updated_at
          `)
          .eq("id", session.user.id)
          .single();

        if (!mounted) return;

        if (error) {
          console.error('Profile fetch error:', error);
          setError(`Error fetching profile: ${error.message}`);
          setProfile(null);
        } else if (data) {
          // Set default values for missing fields and ensure role type safety
          const validRole = data.role as Profile['role'] || 'Community Member';
          
          const profileWithDefaults: Profile = {
            id: data.id || session.user.id,
            national_id: data.national_id || '',
            name: data.name || '',
            email: data.email || session.user.email || '',
            phone: data.phone || null,
            role: validRole,
            farm_group_id: data.farm_group_id || null,
            avatar_url: data.avatar_url || null,
            id_document_url: data.id_document_url || null,
            face_photo_url: data.face_photo_url || null,
            face_verified: data.face_verified || false,
            email_verified: data.email_verified || true,
            payment_verified: data.payment_verified || false,
            account_approved: data.account_approved || false,
            approved_by: data.approved_by || null,
            approved_at: data.approved_at || null,
            trust_score: data.trust_score || 0,
            location: data.location || null,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
          };
          setProfile(profileWithDefaults);
        }
      } catch (err) {
        if (mounted) {
          console.error('Unexpected error:', err);
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
      
      const validRole = data.role as Profile['role'] || 'Community Member';
      
      const profileWithDefaults: Profile = {
        id: data.id || user.id,
        national_id: data.national_id || '',
        name: data.name || '',
        email: data.email || user.email || '',
        phone: data.phone || null,
        role: validRole,
        farm_group_id: data.farm_group_id || null,
        avatar_url: data.avatar_url || null,
        id_document_url: data.id_document_url || null,
        face_photo_url: data.face_photo_url || null,
        face_verified: data.face_verified || false,
        email_verified: data.email_verified || true,
        payment_verified: data.payment_verified || false,
        account_approved: data.account_approved || false,
        approved_by: data.approved_by || null,
        approved_at: data.approved_at || null,
        trust_score: data.trust_score || 0,
        location: data.location || null,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };
      
      setProfile(profileWithDefaults);
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