import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface CustomUser {
  id: string
  email: string
  user_metadata: {
    user_type: string
    university_id?: string
    profile: any
  }
}

interface AuthContextType {
  user: CustomUser | null
  session: Session | null
  userType: 'platform_admin' | 'university_admin' | 'university_user' | null
  universityId: string | null
  userProfile: any | null
  signIn: (email: string, password: string, userType: 'platform_admin' | 'university_admin' | 'university_user', universityId?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userType, setUserType] = useState<'platform_admin' | 'university_admin' | 'university_user' | null>(null)
  const [universityId, setUniversityId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)

  // Check localStorage on mount for persistence
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth_user')
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth)
        setUser(authData.user)
        setUserType(authData.userType)
        setUniversityId(authData.universityId)
        setUserProfile(authData.userProfile)
      } catch (error) {
        console.error('Error parsing stored auth:', error)
        localStorage.removeItem('auth_user')
      }
    }
  }, [])

  const signIn = async (
    email: string, 
    password: string, 
    userType: 'platform_admin' | 'university_admin' | 'university_user',
    _universityId?: string
  ) => {
    let validUser = null

    if (userType === 'university_user') {
      // Query university_users table for university users
      const { data: universityUser, error: userError } = await supabase
        .from('university_users')
        .select(`
          *,
          university:universities(*)
        `)
        .eq('email', email)
        .eq('status', 'active')
        .single()

      if (userError || !universityUser) {
        throw new Error('Invalid credentials or user account not found')
      }

      // Check password against database
      if (password !== universityUser.password) {
        throw new Error('Invalid email or password')
      }

      validUser = {
        id: universityUser.id,
        email: universityUser.email,
        user_metadata: {
          user_type: 'university_user',
          university_id: universityUser.university_id,
          profile: {
            first_name: universityUser.first_name,
            last_name: universityUser.last_name,
            student_id: universityUser.student_id,
            department: universityUser.department,
            year_level: universityUser.year_level,
            university_name: universityUser.university?.name || 'University'
          }
        }
      } as CustomUser

    } else {
      // For platform admins, use hardcoded credentials
      const platformCredentials = [
        { email: 'admin@platform.com', password: 'password123', role: 'platform_admin', id: 'admin1' },
        { email: 'superadmin@platform.com', password: 'admin123', role: 'platform_admin', id: 'superadmin1' },
      ]

      const validCred = platformCredentials.find(
        cred => cred.email === email && cred.password === password && cred.role === userType
      )

      if (!validCred) {
        throw new Error('Invalid email or password')
      }

      validUser = {
        id: validCred.id,
        email: validCred.email,
        user_metadata: {
          user_type: validCred.role,
          university_id: undefined,
          profile: {
            university_name: 'Platform Admin'
          }
        }
      } as CustomUser
    }

    // Set auth state
    setUser(validUser)
    setUserType(validUser.user_metadata.user_type as 'platform_admin' | 'university_admin' | 'university_user')
    setUniversityId(validUser.user_metadata.university_id || null)
    setUserProfile(validUser.user_metadata.profile)

    // Store in localStorage for persistence
    localStorage.setItem('auth_user', JSON.stringify({
      user: validUser,
      userType: validUser.user_metadata.user_type,
      universityId: validUser.user_metadata.university_id,
      userProfile: validUser.user_metadata.profile
    }))
  }

  const signOut = async () => {
    // Clear auth state
    setUser(null)
    setSession(null)
    setUserType(null)
    setUniversityId(null)
    setUserProfile(null)
    
    // Clear localStorage
    localStorage.removeItem('auth_user')
    
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    userType,
    universityId,
    userProfile,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 