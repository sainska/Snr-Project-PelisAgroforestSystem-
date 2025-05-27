import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // NEW: error state

  // Handle session initialization and changes
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (mounted) setSession(session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
      setError(null); // Reset error on new attempt

      if (!session?.user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
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
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;

      if (error) {
        setError(`Error fetching profile: ${error.message}`);
        setUserProfile(null);
      } else {
        setUserProfile(data);
      }
      setLoading(false);
    };

    fetchUserProfile();

    return () => { mounted = false; };
  }, [session]);

  // Don't render children until loading is false
  return (
    <AuthContext.Provider value={{ session, userProfile, loading, error }}>
      {loading ? <div>Loading authentication...</div> : children}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
