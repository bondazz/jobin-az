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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          content: Json | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          section_type: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          section_type: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          section_type?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          click_count: number
          created_at: string
          description: string | null
          display_order: number
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          position: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          click_count?: number
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          position: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          click_count?: number
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          about_seo_description: string | null
          about_seo_title: string | null
          address: string | null
          background_image: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          jobs_seo_description: string | null
          jobs_seo_title: string | null
          logo: string | null
          name: string
          phone: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          about_seo_description?: string | null
          about_seo_title?: string | null
          address?: string | null
          background_image?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          jobs_seo_description?: string | null
          jobs_seo_title?: string | null
          logo?: string | null
          name: string
          phone?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          about_seo_description?: string | null
          about_seo_title?: string | null
          address?: string | null
          background_image?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          jobs_seo_description?: string | null
          jobs_seo_title?: string | null
          logo?: string | null
          name?: string
          phone?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_email: string | null
          application_type: string | null
          application_url: string | null
          category_id: string | null
          company_id: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          location: string
          salary: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          views: number
        }
        Insert: {
          application_email?: string | null
          application_type?: string | null
          application_url?: string | null
          category_id?: string | null
          company_id?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          location: string
          salary?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          views?: number
        }
        Update: {
          application_email?: string | null
          application_type?: string | null
          application_url?: string | null
          category_id?: string | null
          company_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          location?: string
          salary?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_features: {
        Row: {
          basic_plan: boolean
          category: string
          created_at: string
          display_order: number
          enterprise_plan: boolean
          feature_name: string
          id: string
          is_active: boolean
          premium_plan: boolean
          updated_at: string
        }
        Insert: {
          basic_plan?: boolean
          category: string
          created_at?: string
          display_order?: number
          enterprise_plan?: boolean
          feature_name: string
          id?: string
          is_active?: boolean
          premium_plan?: boolean
          updated_at?: string
        }
        Update: {
          basic_plan?: boolean
          category?: string
          created_at?: string
          display_order?: number
          enterprise_plan?: boolean
          feature_name?: string
          id?: string
          is_active?: boolean
          premium_plan?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          description: string
          display_order: number
          features: string[]
          icon: string
          id: string
          is_active: boolean
          is_popular: boolean
          name: string
          period: string
          price: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          features?: string[]
          icon?: string
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name: string
          period: string
          price: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          features?: string[]
          icon?: string
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name?: string
          period?: string
          price?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_clicks: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referral_user_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referral_user_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referral_user_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      referral_job_submissions: {
        Row: {
          admin_comment: string | null
          applicant_name: string
          applicant_phone: string
          applicant_position: string
          applicant_surname: string
          company_description: string | null
          company_name: string
          created_at: string
          id: string
          job_article: string
          referral_code: string | null
          referral_user_id: string | null
          status: string
          updated_at: string
          voen: string | null
          website: string | null
        }
        Insert: {
          admin_comment?: string | null
          applicant_name: string
          applicant_phone: string
          applicant_position: string
          applicant_surname: string
          company_description?: string | null
          company_name: string
          created_at?: string
          id?: string
          job_article: string
          referral_code?: string | null
          referral_user_id?: string | null
          status?: string
          updated_at?: string
          voen?: string | null
          website?: string | null
        }
        Update: {
          admin_comment?: string | null
          applicant_name?: string
          applicant_phone?: string
          applicant_position?: string
          applicant_surname?: string
          company_description?: string | null
          company_name?: string
          created_at?: string
          id?: string
          job_article?: string
          referral_code?: string | null
          referral_user_id?: string | null
          status?: string
          updated_at?: string
          voen?: string | null
          website?: string | null
        }
        Relationships: []
      }
      referral_requests: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          job_title: string | null
          message: string | null
          phone: string | null
          referral_code: string
          referral_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          job_title?: string | null
          message?: string | null
          phone?: string | null
          referral_code: string
          referral_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          job_title?: string | null
          message?: string | null
          phone?: string | null
          referral_code?: string
          referral_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          clicks: number
          code: string
          confirmations_count: number
          created_at: string
          earnings_azn: number
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          clicks?: number
          code: string
          confirmations_count?: number
          created_at?: string
          earnings_azn?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          clicks?: number
          code?: string
          confirmations_count?: number
          created_at?: string
          earnings_azn?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          card_number: string | null
          created_at: string
          id: string
          is_default: boolean
          m10_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_number?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          m10_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_number?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          m10_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_comment: string | null
          amount: number
          created_at: string
          destination: string
          id: string
          method: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          amount: number
          created_at?: string
          destination: string
          id?: string
          method: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          amount?: number
          created_at?: string
          destination?: string
          id?: string
          method?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      jobs_public: {
        Row: {
          application_type: string | null
          application_url: string | null
          category_id: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          location: string | null
          salary: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string | null
          tags: string[] | null
          title: string | null
          type: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          application_type?: string | null
          application_url?: string | null
          category_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          location?: string | null
          salary?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          application_type?: string | null
          application_url?: string | null
          category_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          location?: string | null
          salary?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_all_companies: {
        Args: Record<PropertyKey, never>
        Returns: {
          about_seo_description: string
          about_seo_title: string
          address: string
          background_image: string
          created_at: string
          description: string
          email: string
          id: string
          is_active: boolean
          is_verified: boolean
          jobs_seo_description: string
          jobs_seo_title: string
          logo: string
          name: string
          phone: string
          seo_description: string
          seo_keywords: string[]
          seo_title: string
          slug: string
          updated_at: string
          website: string
        }[]
      }
      get_company_contact: {
        Args: { company_uuid: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      get_job_application_email: {
        Args: { job_uuid: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      increment_ad_clicks: {
        Args: { ad_id: string }
        Returns: undefined
      }
      increment_job_views: {
        Args: { job_id: string }
        Returns: undefined
      }
      log_referral_click: {
        Args: { code: string; ua: string }
        Returns: undefined
      }
      search_companies: {
        Args: { search_term: string }
        Returns: {
          about_seo_description: string
          about_seo_title: string
          address: string
          background_image: string
          created_at: string
          description: string
          email: string
          id: string
          is_active: boolean
          is_verified: boolean
          jobs_seo_description: string
          jobs_seo_title: string
          logo: string
          name: string
          phone: string
          seo_description: string
          seo_keywords: string[]
          seo_title: string
          slug: string
          updated_at: string
          website: string
        }[]
      }
      submit_referral_request: {
        Args: {
          _code: string
          _company_name: string
          _contact_email: string
          _contact_name: string
          _job_title: string
          _message: string
          _phone: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
