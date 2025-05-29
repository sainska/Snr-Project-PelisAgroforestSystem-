
import type { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export type Profile = {
  id: string;
  national_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'Admin' | 'Officer' | 'Community Member' | 'NNECFA Admin' | 'NNECFA Official';
  farm_group_id: string | null;
  avatar_url: string | null;
  id_document_url: string | null;
  face_photo_url: string | null;
  face_verified: boolean;
  email_verified: boolean;
  payment_verified: boolean;
  account_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  trust_score: number;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata: { 
      name: string; 
      phone: string; 
      national_id: string; 
      location: string;
      role?: string;
      id_document_url?: string;
      face_photo_url?: string;
    }
  ) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadDocument: (file: File, type: 'id' | 'face') => Promise<string>;
  submitPayment: (mpesaCode: string, phoneNumber: string) => Promise<void>;
  checkAccountStatus: () => Promise<{
    isApproved: boolean;
    paymentVerified: boolean;
    emailVerified: boolean;
    faceVerified: boolean;
  }>;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

export interface AccountStatus {
  isApproved: boolean;
  paymentVerified: boolean;
  emailVerified: boolean;
  faceVerified: boolean;
}