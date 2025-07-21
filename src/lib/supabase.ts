import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          mobile_number: string
          full_name: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mobile_number: string
          full_name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mobile_number?: string
          full_name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          document_type: string
          document_name: string
          document_number: string | null
          issue_date: string | null
          expiry_date: string
          person_name: string
          relationship: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: string
          document_name: string
          document_number?: string | null
          issue_date?: string | null
          expiry_date: string
          person_name: string
          relationship: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: string
          document_name?: string
          document_number?: string | null
          issue_date?: string | null
          expiry_date?: string
          person_name?: string
          relationship?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}