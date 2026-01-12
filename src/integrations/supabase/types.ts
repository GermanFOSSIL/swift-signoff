export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          org_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          org_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          org_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          org_id: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          org_id?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          org_id?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplines: {
        Row: {
          code: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplines_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      itr_templates: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discipline_id: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          org_id: string
          schema_json: Json
          updated_at: string
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discipline_id?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          org_id: string
          schema_json?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discipline_id?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          org_id?: string
          schema_json?: Json
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "itr_templates_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itr_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      itrs: {
        Row: {
          approved_at: string | null
          assigned_to: string | null
          created_at: string
          created_by: string
          current_step: number | null
          id: string
          itr_number: string
          org_id: string
          pdf_url: string | null
          rejected_at: string | null
          rejection_reason: string | null
          responses: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["itr_status"]
          submitted_at: string | null
          tag_id: string
          template_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by: string
          current_step?: number | null
          id?: string
          itr_number: string
          org_id: string
          pdf_url?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          responses?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["itr_status"]
          submitted_at?: string | null
          tag_id: string
          template_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          current_step?: number | null
          id?: string
          itr_number?: string
          org_id?: string
          pdf_url?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          responses?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["itr_status"]
          submitted_at?: string | null
          tag_id?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itrs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itrs_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itrs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "itr_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client: string | null
          code: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          metadata: Json | null
          name: string
          org_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client?: string | null
          code: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name: string
          org_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client?: string | null
          code?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name?: string
          org_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_items: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["punch_category"]
          cleared_at: string | null
          cleared_by: string | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          itr_id: string | null
          metadata: Json | null
          org_id: string
          priority: number | null
          project_id: string
          punch_number: string
          status: Database["public"]["Enums"]["punch_status"]
          subsystem_id: string | null
          system_id: string | null
          tag_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["punch_category"]
          cleared_at?: string | null
          cleared_by?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          itr_id?: string | null
          metadata?: Json | null
          org_id: string
          priority?: number | null
          project_id: string
          punch_number: string
          status?: Database["public"]["Enums"]["punch_status"]
          subsystem_id?: string | null
          system_id?: string | null
          tag_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["punch_category"]
          cleared_at?: string | null
          cleared_by?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          itr_id?: string | null
          metadata?: Json | null
          org_id?: string
          priority?: number | null
          project_id?: string
          punch_number?: string
          status?: Database["public"]["Enums"]["punch_status"]
          subsystem_id?: string | null
          system_id?: string | null
          tag_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "punch_items_itr_id_fkey"
            columns: ["itr_id"]
            isOneToOne: false
            referencedRelation: "itrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_subsystem_id_fkey"
            columns: ["subsystem_id"]
            isOneToOne: false
            referencedRelation: "subsystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      signoffs: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          itr_id: string
          org_id: string
          signature_data: string | null
          signed_at: string
          signoff_type: Database["public"]["Enums"]["signoff_type"]
          user_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          itr_id: string
          org_id: string
          signature_data?: string | null
          signed_at?: string
          signoff_type: Database["public"]["Enums"]["signoff_type"]
          user_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          itr_id?: string
          org_id?: string
          signature_data?: string | null
          signed_at?: string
          signoff_type?: Database["public"]["Enums"]["signoff_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signoffs_itr_id_fkey"
            columns: ["itr_id"]
            isOneToOne: false
            referencedRelation: "itrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signoffs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      subsystems: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          org_id: string
          status: string
          system_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          org_id: string
          status?: string
          system_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          org_id?: string
          status?: string
          system_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subsystems_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subsystems_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      systems: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          org_id: string
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          org_id: string
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          org_id?: string
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "systems_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "systems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          description: string | null
          discipline_id: string | null
          equipment_type: string | null
          id: string
          location: string | null
          manufacturer: string | null
          metadata: Json | null
          model: string | null
          org_id: string
          serial_number: string | null
          status: string
          subsystem_id: string
          tag_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discipline_id?: string | null
          equipment_type?: string | null
          id?: string
          location?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          org_id: string
          serial_number?: string | null
          status?: string
          subsystem_id: string
          tag_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discipline_id?: string | null
          equipment_type?: string | null
          id?: string
          location?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          org_id?: string
          serial_number?: string | null
          status?: string
          subsystem_id?: string
          tag_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_subsystem_id_fkey"
            columns: ["subsystem_id"]
            isOneToOne: false
            referencedRelation: "subsystems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: never; Returns: string }
      has_any_role: {
        Args: { _roles: Database["public"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_org_admin: { Args: { _org_id: string }; Returns: boolean }
      is_org_member: { Args: { _org_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "inspector" | "supervisor" | "user"
      itr_status: "draft" | "in_review" | "approved" | "rejected"
      member_status: "pending" | "active" | "inactive"
      punch_category: "A" | "B" | "C"
      punch_status: "open" | "in_progress" | "cleared" | "closed"
      signoff_type: "inspector" | "supervisor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "inspector", "supervisor", "user"],
      itr_status: ["draft", "in_review", "approved", "rejected"],
      member_status: ["pending", "active", "inactive"],
      punch_category: ["A", "B", "C"],
      punch_status: ["open", "in_progress", "cleared", "closed"],
      signoff_type: ["inspector", "supervisor"],
    },
  },
} as const
