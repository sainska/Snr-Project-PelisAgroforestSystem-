import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { AuthResponse, AuthError } from '@supabase/supabase-js';
import type { Profile, AccountStatus } from '@/types/auth';
import { darajaService } from './darajaService';

export const authService = {
  async checkNationalIdExists(nationalId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_national_id_exists', {
        p_national_id: nationalId
      });
      
      if (error) {
        console.error('Error checking national ID:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Error checking national ID:', error);
      return false;
    }
  },

  async verifyMpesaPayment(mpesaCode: string, phoneNumber: string): Promise<boolean> {
    try {
      // First check if the payment code has already been used
      const { data: existingPayment, error: existingError } = await supabase
        .from('payments')
        .select('*')
        .eq('mpesa_code', mpesaCode)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing payment:', existingError);
        return false;
      }

      // If payment exists, check if it belongs to the same phone number
      if (existingPayment) {
        if (existingPayment.phone_number !== phoneNumber) {
          throw new Error('This M-Pesa code has already been used by another user.');
        }
        return true;
      }

      // If payment doesn't exist, verify with M-Pesa API (using RPC function)
      const { data, error } = await supabase.rpc('verify_mpesa_code_exists', {
        p_mpesa_code: mpesaCode,
        p_phone_number: phoneNumber
      });
      
      if (error) {
        console.error('Error verifying M-Pesa payment:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying M-Pesa payment:', error);
      return false;
    }
  },

  async initiateSTKPush(phoneNumber: string, amount: number, accountReference: string): Promise<any> {
    try {
      // Validate phone number format
      if (!phoneNumber.match(/^254[0-9]{9}$/)) {
        throw new Error('Invalid phone number format. Use format: 254XXXXXXXXX');
      }

      // Use darajaService instead of RPC function
      const result = await darajaService.initiateSTKPush(phoneNumber, amount, accountReference);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to initiate STK push');
      }

      // Create a pending payment record
      const { error: paymentError } = await supabase
        .from('stk_push_requests')
        .insert({
          phone_number: phoneNumber,
          amount: amount,
          account_reference: accountReference,
          status: 'processing',
          checkout_request_id: result.checkout_request_id,
          merchant_request_id: result.merchant_request_id
        });

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't throw here, as the STK push was successful
      }
      
      return {
        success: true,
        checkout_request_id: result.checkout_request_id,
        merchant_request_id: result.merchant_request_id,
        message: result.customer_message
      };
    } catch (error) {
      console.error('Error initiating STK push:', error);
      throw error;
    }
  },

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
      
      // Check if national ID already exists
      const nationalIdExists = await this.checkNationalIdExists(metadata.national_id);
      if (nationalIdExists) {
        return { 
          data: { user: null, session: null }, 
          error: { 
            message: 'This National ID is already registered. Please use a different National ID or contact support.',
            name: 'ValidationError',
            status: 400
          } as AuthError
        };
      }
      
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

  async signIn(emailOrNationalId: string, password: string) {
    try {
      let loginEmail = emailOrNationalId;

      // Check if the input looks like a national ID (not containing @ symbol)
      if (!emailOrNationalId.includes('@')) {
        // Get email by national ID using our database function
        const { data: email, error: emailError } = await supabase
          .rpc('get_user_email_by_national_id', {
            check_national_id: emailOrNationalId
          });

        if (emailError || !email) {
          return {
            data: { user: null, session: null },
            error: {
              message: 'National ID not found. Please check your National ID or use your email address.',
              name: 'NotFoundError',
              status: 404
            } as AuthError
          };
        }

        loginEmail = email;
      }

      // Proceed with login using the email
      console.log('Attempting to sign in with email:', loginEmail);
      const result = await supabase.auth.signInWithPassword({ 
        email: loginEmail, 
        password 
      });
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

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_email_exists', {
          check_email: email
        });
      
      if (error) {
        console.error('Error checking email:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  },

  async resetPassword(email: string) {
    try {
      // Check if email exists in the database
      const emailExists = await this.checkEmailExists(email);
      
      if (!emailExists) {
        return {
          error: {
            message: 'This email is not registered in our system.',
            name: 'NotFoundError',
            status: 404
          } as AuthError
        };
      }

      // If email exists, proceed with password reset
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Error in resetPassword:', error);
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        error: {
          message: 'An unexpected error occurred. Please try again later.',
          name: 'UnexpectedError',
          status: 500
        } as AuthError
      };
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

      // Verify M-Pesa payment first
      const isPaymentValid = await this.verifyMpesaPayment(mpesaCode, phoneNumber);
      if (!isPaymentValid) {
        throw new Error('Invalid M-Pesa payment code or phone number. Please check your payment details.');
      }

      // Get current timestamp
      const now = new Date().toISOString();

      // Check if this was an STK push payment
      const { data: stkRequest } = await supabase
        .from('stk_push_requests')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('mpesa_receipt_number', mpesaCode)
        .single();

      // Insert payment record into payments table
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          mpesa_code: mpesaCode,
          phone_number: phoneNumber,
          amount: 300.00,
          status: 'Verified',
          created_at: now,
          updated_at: now,
          verified_at: now,
          verified_by: 'system',
          stk_request_id: stkRequest?.id // Link to STK request if it exists
        });

      if (insertError) {
        console.error('Error inserting payment:', insertError);
        if (insertError.code === '23505') { // Unique violation
          throw new Error('This M-Pesa code has already been used. Please provide a different payment.');
        }
        throw insertError;
      }

      // If this was an STK push payment, update its status
      if (stkRequest) {
        await supabase
          .from('stk_push_requests')
          .update({
            status: 'completed',
            mpesa_receipt_number: mpesaCode,
            updated_at: now
          })
          .eq('id', stkRequest.id);
      }

      // Update user profile to mark payment as verified
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ payment_verified: true })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile payment status:', updateError);
        throw updateError;
      }

      toast({
        title: 'Payment verified',
        description: 'Your payment has been verified successfully.',
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'There was a problem verifying your payment.',
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
  },

  async createFirstAdminAccount(): Promise<boolean> {
    try {
      // Check if any users exist
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // If users already exist, return false
      if (count && count > 0) {
        return false;
      }

      // Get the admin role ID
      const { data: roleId, error: roleError } = await supabase
        .rpc('get_role_id_by_name', {
          role_name: 'NNECFA Admin'
        });

      if (roleError || !roleId) {
        console.error('Error getting admin role ID:', roleError);
        return false;
      }

      // Create the first admin account
      const adminEmail = 'admin@nnecfa.org';
      const adminPassword = 'Admin@NNECFA2024'; // This should be changed immediately after first login
      const adminMetadata = {
        name: 'System Administrator',
        phone: '',
        national_id: 'ADMIN001',
        location: 'NNECFA Headquarters',
        role_id: roleId,
        email_verified: true,
        payment_verified: true,
        face_verified: true,
        account_approved: true
      };

      const { data, error } = await this.signUp(adminEmail, adminPassword, adminMetadata);

      if (error) {
        console.error('Error creating admin account:', error);
        return false;
      }

      if (data.user) {
        // Update the profile to mark it as verified and approved
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email_verified: true,
            payment_verified: true,
            face_verified: true,
            account_approved: true,
            role_id: roleId,
            trust_score: 100
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Error updating admin profile:', updateError);
          return false;
        }

        console.log('First admin account created successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in createFirstAdminAccount:', error);
      return false;
    }
  },

  async createNNECFAOfficial(
    email: string,
    name: string,
    phone: string,
    national_id: string,
    location: string,
    createdByAdminId: string
  ): Promise<AuthResponse> {
    try {
      // Get the official role ID
      const { data: roleId, error: roleError } = await supabase
        .rpc('get_role_id_by_name', {
          role_name: 'NNECFA Official'
        });

      if (roleError || !roleId) {
        throw new Error('Error getting official role ID');
      }

      // Generate a temporary password
      const tempPassword = `NNECFA${Math.random().toString(36).slice(-8)}`;
      
      const officialMetadata = {
        name,
        phone,
        national_id,
        location,
        role_id: roleId,
        email_verified: true,
        payment_verified: true,
        face_verified: true,
        account_approved: true
      };

      const { data, error } = await this.signUp(email, tempPassword, officialMetadata);

      if (error) {
        throw error;
      }

      if (data.user) {
        // Update the profile
        await supabase
          .from('profiles')
          .update({
            email_verified: true,
            payment_verified: true,
            face_verified: true,
            account_approved: true,
            role_id: roleId,
            trust_score: 90,
            approved_by: createdByAdminId,
            approved_at: new Date().toISOString()
          })
          .eq('id', data.user.id);

        // Send password reset email
        await this.resetPassword(email);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating NNECFA Official:', error);
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }
};
