export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      backup_history: {
        Row: {
          backup_date: string
          file_path: string | null
          file_size: number | null
          id: string
          notes: string | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          backup_date?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          notes?: string | null
          status: string
          triggered_by?: string | null
        }
        Update: {
          backup_date?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          notes?: string | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      crop_reports: {
        Row: {
          actual_harvest_date: string | null
          area_planted: number
          created_at: string
          crop_type_id: string
          expected_harvest_date: string | null
          id: string
          notes: string | null
          photos: Json | null
          planting_date: string
          plot_id: string
          updated_at: string
          user_id: string
          yield_amount: number | null
          yield_unit: string | null
        }
        Insert: {
          actual_harvest_date?: string | null
          area_planted: number
          created_at?: string
          crop_type_id: string
          expected_harvest_date?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          planting_date: string
          plot_id: string
          updated_at?: string
          user_id: string
          yield_amount?: number | null
          yield_unit?: string | null
        }
        Update: {
          actual_harvest_date?: string | null
          area_planted?: number
          created_at?: string
          crop_type_id?: string
          expected_harvest_date?: string | null
          id?: string
          notes?: string | null
          photos?: Json | null
          planting_date?: string
          plot_id?: string
          updated_at?: string
          user_id?: string
          yield_amount?: number | null
          yield_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_reports_crop_type_id_fkey"
            columns: ["crop_type_id"]
            isOneToOne: false
            referencedRelation: "crop_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_reports_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_types: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      farm_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          region: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          region: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          id: string
          is_resolved: boolean | null
          message: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitoring_records: {
        Row: {
          compliance_level: number
          condition: string
          created_at: string
          crop_condition: string | null
          flagged: boolean | null
          id: string
          officer_id: string
          photos: Json | null
          plot_id: string
          recommendations: string | null
          tree_growth_status: string | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          compliance_level: number
          condition: string
          created_at?: string
          crop_condition?: string | null
          flagged?: boolean | null
          id?: string
          officer_id: string
          photos?: Json | null
          plot_id: string
          recommendations?: string | null
          tree_growth_status?: string | null
          updated_at?: string
          visit_date: string
        }
        Update: {
          compliance_level?: number
          condition?: string
          created_at?: string
          crop_condition?: string | null
          flagged?: boolean | null
          id?: string
          officer_id?: string
          photos?: Json | null
          plot_id?: string
          recommendations?: string | null
          tree_growth_status?: string | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_records_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          mpesa_code: string
          phone_number: string
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          mpesa_code: string
          phone_number: string
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mpesa_code?: string
          phone_number?: string
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      plot_applications: {
        Row: {
          applicant_id: string
          created_at: string
          id: string
          notes: string | null
          plot_id: string | null
          preferred_size: number
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          id?: string
          notes?: string | null
          plot_id?: string | null
          preferred_size: number
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          plot_id?: string | null
          preferred_size?: number
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plot_applications_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          assignment_date: string | null
          created_at: string
          expiry_date: string | null
          gps_coordinates: Json | null
          id: string
          location_description: string | null
          name: string
          notes: string | null
          size: number
          status: Database["public"]["Enums"]["plot_status"]
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          assignment_date?: string | null
          created_at?: string
          expiry_date?: string | null
          gps_coordinates?: Json | null
          id?: string
          location_description?: string | null
          name: string
          notes?: string | null
          size: number
          status?: Database["public"]["Enums"]["plot_status"]
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          assignment_date?: string | null
          created_at?: string
          expiry_date?: string | null
          gps_coordinates?: Json | null
          id?: string
          location_description?: string | null
          name?: string
          notes?: string | null
          size?: number
          status?: Database["public"]["Enums"]["plot_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          face_photo_url: string | null
          face_verified: boolean | null
          farm_group_id: string | null
          full_name: string | null
          id: string
          id_document_url: string | null
          location: string | null
          name: string | null
          national_id: string | null
          payment_verified: boolean | null
          phone: string | null
          role: string | null
          trust_score: number | null
          updated_at: string | null
        }
        Insert: {
          account_approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          face_photo_url?: string | null
          face_verified?: boolean | null
          farm_group_id?: string | null
          full_name?: string | null
          id: string
          id_document_url?: string | null
          location?: string | null
          name?: string | null
          national_id?: string | null
          payment_verified?: boolean | null
          phone?: string | null
          role?: string | null
          trust_score?: number | null
          updated_at?: string | null
        }
        Update: {
          account_approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          face_photo_url?: string | null
          face_verified?: boolean | null
          farm_group_id?: string | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          location?: string | null
          name?: string | null
          national_id?: string | null
          payment_verified?: boolean | null
          phone?: string | null
          role?: string | null
          trust_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_farm_group_id_fkey"
            columns: ["farm_group_id"]
            isOneToOne: false
            referencedRelation: "farm_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      violations: {
        Row: {
          created_at: string
          description: string
          id: string
          monitoring_id: string
          reported_by: string
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity_level: number
          type: Database["public"]["Enums"]["violation_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          monitoring_id: string
          reported_by: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity_level: number
          type: Database["public"]["Enums"]["violation_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          monitoring_id?: string
          reported_by?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity_level?: number
          type?: Database["public"]["Enums"]["violation_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "violations_monitoring_id_fkey"
            columns: ["monitoring_id"]
            isOneToOne: false
            referencedRelation: "monitoring_records"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      verify_mpesa_payment: {
        Args: {
          p_mpesa_code: string
          p_phone_number: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "Pending" | "Under Review" | "Approved" | "Rejected"
      plot_status:
        | "Available"
        | "Applied"
        | "Approved"
        | "Rejected"
        | "Assigned"
        | "Active"
        | "Inactive"
      user_role:
        | "Community Member"
        | "Forest Officer"
        | "NNECFA Official"
        | "Admin"
      violation_type:
        | "Illegal Cutting"
        | "Boundary Violation"
        | "Unauthorized Crops"
        | "Late Reporting"
        | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["Pending", "Under Review", "Approved", "Rejected"],
      plot_status: [
        "Available",
        "Applied",
        "Approved",
        "Rejected",
        "Assigned",
        "Active",
        "Inactive",
      ],
      user_role: [
        "Community Member",
        "Forest Officer",
        "NNECFA Official",
        "Admin",
      ],
      violation_type: [
        "Illegal Cutting",
        "Boundary Violation",
        "Unauthorized Crops",
        "Late Reporting",
        "Other",
      ],
    },
  },
} as const