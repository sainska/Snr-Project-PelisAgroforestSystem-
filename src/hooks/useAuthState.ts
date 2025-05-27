
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        return;
      }

      if (session) {
        setSession(session);
        setUser(session.user);

        // Fetch profile with all the new fields
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            national_id,
            name,
            email,
            phone,
            role,
            farm_group_id,
            avatar_url,
            id_document_url,
            face_photo_url,
            face_verified,
            email_verified,
            payment_verified,
            account_approved,
            approved_by,
            approved_at,
            trust_score,
            location,
            created_at,
            updated_at
          `)
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          console.log('Profile fetched:', profileData);
          setProfile(profileData);
        }
      }

      setIsLoading(false);
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          // Fetch profile data when user signs in
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select(`
                id,
                national_id,
                name,
                email,
                phone,
                role,
                farm_group_id,
                avatar_url,
                id_document_url,
                face_photo_url,
                face_verified,
                email_verified,
                payment_verified,
                account_approved,
                approved_by,
                approved_at,
                trust_score,
                location,
                created_at,
                updated_at
              `)
              .eq('id', session.user.id)
              .single();

            setProfile(profileData || null);
          }, 0);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    session,
    isLoading,
    setProfile
  };
};
