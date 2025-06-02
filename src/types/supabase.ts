export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_log: {
        Row: {
          id: string
          user_id: string
          related_user_id: string | null
          type: 'application' | 'report' | 'marketplace' | 'message'
          description: string
          status: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          related_user_id?: string | null
          type: 'application' | 'report' | 'marketplace' | 'message'
          description: string
          status?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          related_user_id?: string | null
          type?: 'application' | 'report' | 'marketplace' | 'message'
          description?: string
          status?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      marketplace_listings: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          quantity: number
          category: string
          image_url: string | null
          vendor_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          quantity?: number
          category: string
          image_url?: string | null
          vendor_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          quantity?: number
          category?: string
          image_url?: string | null
          vendor_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 
