import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signInWithOTP: (mobile: string) => Promise<void>
  verifyOTP: (mobile: string, otp: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signInWithOTP = async (mobile: string) => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co') {
      throw new Error('Please configure your Supabase credentials in the .env file')
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: mobile,
    })
    if (error) throw error
  }

  const verifyOTP = async (mobile: string, otp: string) => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co') {
      throw new Error('Please configure your Supabase credentials in the .env file')
    }

    const { error } = await supabase.auth.verifyOtp({
      phone: mobile,
      token: otp,
      type: 'sms'
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (data: any) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        mobile_number: user.phone || '',
        ...data,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
    await fetchUserProfile(user.id)
  }

  const value = {
    user,
    userProfile,
    loading,
    signInWithOTP,
    verifyOTP,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}