
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { AuthResponse, AuthError } from '@supabase/supabase-js';
import type { Profile, AccountStatus } from '@/types/auth';

export const authService = {
  async signUp(
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
  ): Promise<AuthResponse> {
    try {
      console.log('Attempting to sign up with metadata:', { ...metadata, password: '[HIDDEN]' });
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (signUpError) {
        console.error('Error signing up:', signUpError);
        return { data: { user: null, session: null }, error: signUpError };
      }

      console.log('Sign up successful:', signUpData);
      return { data: signUpData, error: null };
    } catch (error) {
      console.error('Sign-up failed:', error);
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  },

  async signIn(email: string, password: string) {
    try {
      console.log('Attempting to sign in with email:', email);
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('Sign in result:', result);
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  async signOut(navigate: (path: string) => void) {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: 'There was a problem signing out.',
        variant: 'destructive',
      });
    }
  },

  async resetPassword(email: string) {
    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  async updateProfile(data: Partial<Profile>, userId: string, setProfile: (profile: (prev: Profile | null) => Profile | null) => void) {
    try {
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      setProfile(prev => (prev ? { ...prev, ...data } : null));

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'There was a problem updating your profile.',
        variant: 'destructive',
      });
      throw error;
    }
  },

  async uploadDocument(file: File, type: 'id' | 'face', userId: string): Promise<string> {
    try {
      if (!userId) throw new Error('User not authenticated');

      const fileName = `${userId}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
      
      // For now, return a placeholder URL since we don't have storage configured
      // In a real implementation, you would upload to Supabase Storage
      const mockUrl = `https://placeholder.com/${fileName}`;
      
      return mockUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async submitPayment(mpesaCode: string, phoneNumber: string, userId: string) {
    try {
      if (!userId) throw new Error('User not authenticated');

      // Insert payment record into payments table
      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          mpesa_code: mpesaCode,
          phone_number: phoneNumber,
          amount: 300.00,
          status: 'Pending'
        });

      if (error) throw error;

      toast({
        title: 'Payment submitted',
        description: 'Your payment has been submitted for verification.',
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: 'Payment failed',
        description: 'There was a problem submitting your payment.',
        variant: 'destructive',
      });
      throw error;
    }
  },

  async checkAccountStatus(user: any, profile: Profile | null): Promise<AccountStatus> {
    try {
      if (!user || !profile) {
        return {
          isApproved: false,
          paymentVerified: false,
          emailVerified: false,
          faceVerified: false,
        };
      }

      return {
        isApproved: profile.account_approved || false,
        paymentVerified: profile.payment_verified || false,
        emailVerified: profile.email_verified || false,
        faceVerified: profile.face_verified || false,
      };
    } catch (error) {
      console.error('Error checking account status:', error);
      return {
        isApproved: false,
        paymentVerified: false,
        emailVerified: false,
        faceVerified: false,
      };
    }
  }
};