import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string
          name: string
          domain: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          university_id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          university_id: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          university_id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      university_users: {
        Row: {
          id: string
          university_id: string
          email: string
          first_name: string
          last_name: string
          student_id: string | null
          department: string | null
          year_level: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          university_id: string
          email: string
          first_name: string
          last_name: string
          student_id?: string
          department?: string
          year_level?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          university_id?: string
          email?: string
          first_name?: string
          last_name?: string
          student_id?: string
          department?: string
          year_level?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          university_id: string
          title: string
          content: string
          status: 'draft' | 'published' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          university_id: string
          title: string
          content: string
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          university_id?: string
          title?: string
          content?: string
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 