export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      employee_availability_exceptions: {
        Row: {
          availability_type: Database["public"]["Enums"]["availability_type"]
          created_at: string
          employee_id: string
          end_time: string | null
          id: string
          notes: string | null
          organisation_id: string
          preference_strength: number
          start_time: string | null
          updated_at: string
          work_date: string
        }
        Insert: {
          availability_type: Database["public"]["Enums"]["availability_type"]
          created_at?: string
          employee_id: string
          end_time?: string | null
          id?: string
          notes?: string | null
          organisation_id: string
          preference_strength?: number
          start_time?: string | null
          updated_at?: string
          work_date: string
        }
        Update: {
          availability_type?: Database["public"]["Enums"]["availability_type"]
          created_at?: string
          employee_id?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          organisation_id?: string
          preference_strength?: number
          start_time?: string | null
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_availability_exceptio_employee_id_organisation_id_fkey"
            columns: ["employee_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "organisation_id"]
          },
          {
            foreignKeyName: "employee_availability_exceptions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_availability_rules: {
        Row: {
          active: boolean
          availability_type: Database["public"]["Enums"]["availability_type"]
          created_at: string
          day_of_week: number
          effective_from: string | null
          effective_to: string | null
          employee_id: string
          end_time: string | null
          id: string
          notes: string | null
          organisation_id: string
          preference_strength: number
          start_time: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          availability_type: Database["public"]["Enums"]["availability_type"]
          created_at?: string
          day_of_week: number
          effective_from?: string | null
          effective_to?: string | null
          employee_id: string
          end_time?: string | null
          id?: string
          notes?: string | null
          organisation_id: string
          preference_strength?: number
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          availability_type?: Database["public"]["Enums"]["availability_type"]
          created_at?: string
          day_of_week?: number
          effective_from?: string | null
          effective_to?: string | null
          employee_id?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          organisation_id?: string
          preference_strength?: number
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_availability_rules_employee_id_organisation_id_fkey"
            columns: ["employee_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "organisation_id"]
          },
          {
            foreignKeyName: "employee_availability_rules_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_preferences: {
        Row: {
          active: boolean
          created_at: string
          day_of_week: number | null
          employee_id: string
          id: string
          notes: string | null
          organisation_id: string
          preference_type: Database["public"]["Enums"]["employee_preference_type"]
          preference_weight: number
          shift_template_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          day_of_week?: number | null
          employee_id: string
          id?: string
          notes?: string | null
          organisation_id: string
          preference_type: Database["public"]["Enums"]["employee_preference_type"]
          preference_weight: number
          shift_template_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          day_of_week?: number | null
          employee_id?: string
          id?: string
          notes?: string | null
          organisation_id?: string
          preference_type?: Database["public"]["Enums"]["employee_preference_type"]
          preference_weight?: number
          shift_template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_preferences_employee_id_organisation_id_fkey"
            columns: ["employee_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "organisation_id"]
          },
          {
            foreignKeyName: "employee_preferences_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_preferences_shift_template_id_organisation_id_fkey"
            columns: ["shift_template_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "shift_templates"
            referencedColumns: ["id", "organisation_id"]
          },
        ]
      }
      employee_roster_goals: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          maximum_allowed_hours: number
          maximum_desired_hours: number
          minimum_desired_hours: number
          notes: string | null
          organisation_id: string
          overtime_preference: Database["public"]["Enums"]["overtime_preference"]
          roster_period_id: string
          target_hours: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          maximum_allowed_hours: number
          maximum_desired_hours: number
          minimum_desired_hours: number
          notes?: string | null
          organisation_id: string
          overtime_preference: Database["public"]["Enums"]["overtime_preference"]
          roster_period_id: string
          target_hours: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          maximum_allowed_hours?: number
          maximum_desired_hours?: number
          minimum_desired_hours?: number
          notes?: string | null
          organisation_id?: string
          overtime_preference?: Database["public"]["Enums"]["overtime_preference"]
          roster_period_id?: string
          target_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_roster_goals_employee_id_organisation_id_fkey"
            columns: ["employee_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "organisation_id"]
          },
          {
            foreignKeyName: "employee_roster_goals_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_roster_goals_roster_period_id_organisation_id_fkey"
            columns: ["roster_period_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "roster_periods"
            referencedColumns: ["id", "organisation_id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          organisation_id: string
          skill_id: string
          valid_from: string | null
          valid_to: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          organisation_id: string
          skill_id: string
          valid_from?: string | null
          valid_to?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          organisation_id?: string
          skill_id?: string
          valid_from?: string | null
          valid_to?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_employee_id_organisation_id_fkey"
            columns: ["employee_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "organisation_id"]
          },
          {
            foreignKeyName: "employee_skills_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_skills_skill_id_organisation_id_fkey"
            columns: ["skill_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id", "organisation_id"]
          },
        ]
      }
      employees: {
        Row: {
          active: boolean
          created_at: string
          default_maximum_allowed_hours: number
          default_maximum_desired_hours: number
          default_minimum_desired_hours: number
          default_overtime_preference: Database["public"]["Enums"]["overtime_preference"]
          default_target_hours: number
          employee_code: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          full_name: string
          id: string
          notes: string | null
          organisation_id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_maximum_allowed_hours?: number
          default_maximum_desired_hours?: number
          default_minimum_desired_hours?: number
          default_overtime_preference?: Database["public"]["Enums"]["overtime_preference"]
          default_target_hours?: number
          employee_code?: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          full_name: string
          id?: string
          notes?: string | null
          organisation_id: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_maximum_allowed_hours?: number
          default_maximum_desired_hours?: number
          default_minimum_desired_hours?: number
          default_overtime_preference?: Database["public"]["Enums"]["overtime_preference"]
          default_target_hours?: number
          employee_code?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          full_name?: string
          id?: string
          notes?: string | null
          organisation_id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_organisation_id_profile_id_fkey"
            columns: ["organisation_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "organisation_members"
            referencedColumns: ["organisation_id", "user_id"]
          },
        ]
      }
      organisation_members: {
        Row: {
          created_at: string
          organisation_id: string
          role: Database["public"]["Enums"]["organisation_member_role"]
          status: Database["public"]["Enums"]["organisation_member_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          organisation_id: string
          role: Database["public"]["Enums"]["organisation_member_role"]
          status?: Database["public"]["Enums"]["organisation_member_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          organisation_id?: string
          role?: Database["public"]["Enums"]["organisation_member_role"]
          status?: Database["public"]["Enums"]["organisation_member_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organisation_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organisation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      roster_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          organisation_id: string
          published_at: string | null
          start_date: string
          status: Database["public"]["Enums"]["roster_period_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          organisation_id: string
          published_at?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["roster_period_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          organisation_id?: string
          published_at?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["roster_period_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_periods_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_requirements: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          organisation_id: string
          priority: Database["public"]["Enums"]["shift_priority"]
          required_people: number
          roster_period_id: string
          shift_template_id: string
          site_id: string
          status: Database["public"]["Enums"]["shift_requirement_status"]
          updated_at: string
          work_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          organisation_id: string
          priority?: Database["public"]["Enums"]["shift_priority"]
          required_people: number
          roster_period_id: string
          shift_template_id: string
          site_id: string
          status?: Database["public"]["Enums"]["shift_requirement_status"]
          updated_at?: string
          work_date: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          organisation_id?: string
          priority?: Database["public"]["Enums"]["shift_priority"]
          required_people?: number
          roster_period_id?: string
          shift_template_id?: string
          site_id?: string
          status?: Database["public"]["Enums"]["shift_requirement_status"]
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_requirements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_requirements_roster_period_id_organisation_id_fkey"
            columns: ["roster_period_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "roster_periods"
            referencedColumns: ["id", "organisation_id"]
          },
          {
            foreignKeyName: "shift_requirements_shift_template_id_organisation_id_fkey"
            columns: ["shift_template_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "shift_templates"
            referencedColumns: ["id", "organisation_id"]
          },
          {
            foreignKeyName: "shift_requirements_site_id_organisation_id_fkey"
            columns: ["site_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id", "organisation_id"]
          },
        ]
      }
      shift_skill_requirements: {
        Row: {
          created_at: string
          id: string
          organisation_id: string
          required_count: number
          shift_requirement_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organisation_id: string
          required_count: number
          shift_requirement_id: string
          skill_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organisation_id?: string
          required_count?: number
          shift_requirement_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_skill_requirements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_skill_requirements_shift_requirement_id_organisation_fkey"
            columns: ["shift_requirement_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "shift_requirements"
            referencedColumns: ["id", "organisation_id"]
          },
          {
            foreignKeyName: "shift_skill_requirements_skill_id_organisation_id_fkey"
            columns: ["skill_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id", "organisation_id"]
          },
        ]
      }
      shift_templates: {
        Row: {
          active: boolean
          created_at: string
          duration_minutes: number
          end_time: string
          id: string
          is_unsocial: boolean
          name: string
          organisation_id: string
          site_id: string | null
          spans_next_day: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          duration_minutes: number
          end_time: string
          id?: string
          is_unsocial?: boolean
          name: string
          organisation_id: string
          site_id?: string | null
          spans_next_day?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          duration_minutes?: number
          end_time?: string
          id?: string
          is_unsocial?: boolean
          name?: string
          organisation_id?: string
          site_id?: string | null
          spans_next_day?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_templates_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_templates_site_id_organisation_id_fkey"
            columns: ["site_id", "organisation_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id", "organisation_id"]
          },
        ]
      }
      sites: {
        Row: {
          active: boolean
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          organisation_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          organisation_id: string
          timezone: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          organisation_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          organisation_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organisation_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organisation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      onboard_organisation: {
        Args: {
          organisation_name: string
          organisation_slug: string
          organisation_timezone?: string
          profile_full_name: string
        }
        Returns: {
          name: string
          organisation_id: string
          slug: string
        }[]
      }
    }
    Enums: {
      availability_type:
        | "available"
        | "unavailable"
        | "preferred"
        | "not_preferred"
      employee_preference_type:
        | "prefers_morning"
        | "prefers_afternoon"
        | "prefers_night"
        | "avoid_morning"
        | "avoid_afternoon"
        | "avoid_night"
        | "prefers_weekends"
        | "avoid_weekends"
        | "prefers_consecutive_days"
        | "avoid_consecutive_days"
      employment_type:
        | "full_time"
        | "part_time"
        | "casual"
        | "contractor"
        | "other"
      organisation_member_role:
        | "owner"
        | "admin"
        | "scheduler"
        | "manager"
        | "viewer"
      organisation_member_status: "invited" | "active" | "suspended"
      overtime_preference:
        | "likes_overtime"
        | "neutral"
        | "avoid_overtime"
        | "not_allowed"
      roster_period_status:
        | "draft"
        | "generated"
        | "review"
        | "published"
        | "archived"
      shift_priority: "low" | "normal" | "high" | "critical"
      shift_requirement_status: "active" | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      availability_type: [
        "available",
        "unavailable",
        "preferred",
        "not_preferred",
      ],
      employee_preference_type: [
        "prefers_morning",
        "prefers_afternoon",
        "prefers_night",
        "avoid_morning",
        "avoid_afternoon",
        "avoid_night",
        "prefers_weekends",
        "avoid_weekends",
        "prefers_consecutive_days",
        "avoid_consecutive_days",
      ],
      employment_type: [
        "full_time",
        "part_time",
        "casual",
        "contractor",
        "other",
      ],
      organisation_member_role: [
        "owner",
        "admin",
        "scheduler",
        "manager",
        "viewer",
      ],
      organisation_member_status: ["invited", "active", "suspended"],
      overtime_preference: [
        "likes_overtime",
        "neutral",
        "avoid_overtime",
        "not_allowed",
      ],
      roster_period_status: [
        "draft",
        "generated",
        "review",
        "published",
        "archived",
      ],
      shift_priority: ["low", "normal", "high", "critical"],
      shift_requirement_status: ["active", "cancelled"],
    },
  },
} as const
