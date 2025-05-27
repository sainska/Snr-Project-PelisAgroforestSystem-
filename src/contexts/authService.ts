import { supabase } from '@/lib/supabaseClient'; // adjust path as needed

export const authService = {
  signUp: async (
    email: string,
    password: string,
    metadata: {
      name: string;
      phone: string;
      national_id: string;
      location: string;
      id_document_url?: string;
      face_photo_url?: string;
    }
  ) => {
    // 1. Sign up user with metadata inside options.data
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,  // user_metadata JSON column in auth.users table
      },
    });

    if (error) {
      console.error('Error during signUp:', error);
      throw error;
    }

    // 2. Insert user profile in 'profiles' table using returned user ID
    const userId = data.user?.id;
    if (!userId) {
      throw new Error('User ID not returned after signup');
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...metadata }]);

    if (profileError) {
      console.error('Error inserting profile:', profileError);
      throw profileError;
    }

    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async (navigate: (path: string) => void) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate('/login');
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  },

  updateProfile: async (data: any, userId: string, setProfile: (p: any) => void) => {
    // Update in profiles table
    const { error } = await supabase.from('profiles').update(data).eq('id', userId);
    if (error) throw error;

    // Optionally refresh local profile state
    setProfile((prev: any) => ({ ...prev, ...data }));
  },

  uploadDocument: async (file: File, type: 'id' | 'face', userId: string) => {
    const bucket = 'user-documents'; // adjust your bucket name
    const filePath = `${userId}/${type}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;

    const url = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
    return url;
  },

  submitPayment: async (mpesaCode: string, phoneNumber: string, userId: string) => {
    // Implement payment logic here or call your API
  },

  checkAccountStatus: async (user: any, profile: any) => {
    // Implement your logic here
  },
};
