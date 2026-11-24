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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_terms: {
        Row: {
          academic_year: number
          active: boolean
          ends_on: string | null
          id: string
          name: string
          starts_on: string | null
          term_number: number
        }
        Insert: {
          academic_year: number
          active?: boolean
          ends_on?: string | null
          id?: string
          name: string
          starts_on?: string | null
          term_number: number
        }
        Update: {
          academic_year?: number
          active?: boolean
          ends_on?: string | null
          id?: string
          name?: string
          starts_on?: string | null
          term_number?: number
        }
        Relationships: []
      }
      assessments: {
        Row: {
          assessment_date: string | null
          class_id: string
          created_at: string
          created_by: string
          id: string
          subject_id: string
          term_id: string
          title: string
        }
        Insert: {
          assessment_date?: string | null
          class_id: string
          created_at?: string
          created_by: string
          id?: string
          subject_id: string
          term_id: string
          title: string
        }
        Update: {
          assessment_date?: string | null
          class_id?: string
          created_at?: string
          created_by?: string
          id?: string
          subject_id?: string
          term_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          class_id: string
          created_at: string
          id: string
          learner_id: string
          note: string | null
          recorded_by: string
          status: string
        }
        Insert: {
          attendance_date: string
          class_id: string
          created_at?: string
          id?: string
          learner_id: string
          note?: string | null
          recorded_by: string
          status: string
        }
        Update: {
          attendance_date?: string
          class_id?: string
          created_at?: string
          id?: string
          learner_id?: string
          note?: string | null
          recorded_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          active: boolean
          created_at: string
          id: string
          level_order: number
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          level_order?: number
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          level_order?: number
          name?: string
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          amount_kes: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          learner_id: string
          notes: string | null
          paid_at: string
          payment_method: string
          payment_reference: string | null
          receipt_number: string | null
          recorded_by: string | null
          status: string
        }
        Insert: {
          amount_kes: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          learner_id: string
          notes?: string | null
          paid_at?: string
          payment_method: string
          payment_reference?: string | null
          receipt_number?: string | null
          recorded_by?: string | null
          status?: string
        }
        Update: {
          amount_kes?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          learner_id?: string
          notes?: string | null
          paid_at?: string
          payment_method?: string
          payment_reference?: string | null
          receipt_number?: string | null
          recorded_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: number
          active: boolean
          amount_kes: number
          class_id: string
          created_at: string
          id: string
          item_name: string
          study_mode: string
          term_number: number
        }
        Insert: {
          academic_year: number
          active?: boolean
          amount_kes: number
          class_id: string
          created_at?: string
          id?: string
          item_name: string
          study_mode: string
          term_number: number
        }
        Update: {
          academic_year?: number
          active?: boolean
          amount_kes?: number
          class_id?: string
          created_at?: string
          id?: string
          item_name?: string
          study_mode?: string
          term_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_documents: {
        Row: {
          created_at: string
          document_type: string
          id: string
          learner_id: string
          original_filename: string | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          document_type: string
          id?: string
          learner_id: string
          original_filename?: string | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          document_type?: string
          id?: string
          learner_id?: string
          original_filename?: string | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_documents_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learners: {
        Row: {
          admission_number: string
          class_id: string | null
          confidential_notes: string | null
          created_at: string
          date_of_birth: string | null
          enrollment_status: string
          full_name: string
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          study_mode: string
          updated_at: string
        }
        Insert: {
          admission_number: string
          class_id?: string | null
          confidential_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          enrollment_status?: string
          full_name: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          study_mode?: string
          updated_at?: string
        }
        Update: {
          admission_number?: string
          class_id?: string | null
          confidential_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          enrollment_status?: string
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          study_mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learners_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          assessment_id: string
          created_at: string
          feedback: string | null
          grade: string | null
          id: string
          learner_id: string
          maximum_score: number | null
          recorded_by: string
          score: number | null
        }
        Insert: {
          assessment_id: string
          created_at?: string
          feedback?: string | null
          grade?: string | null
          id?: string
          learner_id: string
          maximum_score?: number | null
          recorded_by: string
          score?: number | null
        }
        Update: {
          assessment_id?: string
          created_at?: string
          feedback?: string | null
          grade?: string | null
          id?: string
          learner_id?: string
          maximum_score?: number | null
          recorded_by?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marks_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          audience: string
          body: string
          class_id: string | null
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          publish_at: string | null
          published: boolean
          title: string
        }
        Insert: {
          audience?: string
          body: string
          class_id?: string | null
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          publish_at?: string | null
          published?: boolean
          title: string
        }
        Update: {
          audience?: string
          body?: string
          class_id?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          publish_at?: string | null
          published?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_learners: {
        Row: {
          created_at: string
          id: string
          learner_id: string
          parent_id: string
          primary_contact: boolean
          relationship: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          learner_id: string
          parent_id: string
          primary_contact?: boolean
          relationship?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          learner_id?: string
          parent_id?: string
          primary_contact?: boolean
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_learners_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_learners_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_submissions: {
        Row: {
          amount_kes: number
          id: string
          learner_id: string
          payer_phone: string | null
          payment_method: string
          payment_reference: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          amount_kes: number
          id?: string
          learner_id: string
          payer_phone?: string | null
          payment_method?: string
          payment_reference: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          amount_kes?: number
          id?: string
          learner_id?: string
          payer_phone?: string | null
          payment_method?: string
          payment_reference?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_status: string
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          active: boolean
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
      teacher_classes: {
        Row: {
          class_id: string
          created_at: string
          id: string
          subject_id: string | null
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          subject_id?: string | null
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          subject_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
