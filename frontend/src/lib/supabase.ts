import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yhpjxkbyfbjblibmituf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocGp4a2J5ZmJqYmxpYm1pdHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MjgyNzIsImV4cCI6MjA2NjIwNDI3Mn0.c9TjrqBpOgzlvir32wk6qOL4abxGgfvDKxNNlgQIlEM'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback values.')
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