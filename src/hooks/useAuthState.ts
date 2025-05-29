
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/auth";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        // Ensure role type safety
        const validRole = data.role as Profile['role'] || 'Community Member';
        
        const profileData: Profile = {
          id: data.id,
          national_id: data.national_id || '',
          name: data.name || data.full_name || '',
          email: data.email,
          phone: data.phone,
          role: validRole,
          farm_group_id: data.farm_group_id,
          avatar_url: data.avatar_url,
          id_document_url: data.id_document_url,
          face_photo_url: data.face_photo_url,
          face_verified: data.face_verified || false,
          email_verified: data.email_verified || true,
          payment_verified: data.payment_verified || false,
          account_approved: data.account_approved || false,
          approved_by: data.approved_by,
          approved_at: data.approved_at,
          trust_score: data.trust_score || 0,
          location: data.location,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };
        
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Ensure role type safety for updates
      const updatedProfile = { ...profile, ...updates };
      if (updates.role) {
        updatedProfile.role = updates.role as Profile['role'];
      }
      
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    refreshProfile,
    updateProfile,
  };
};