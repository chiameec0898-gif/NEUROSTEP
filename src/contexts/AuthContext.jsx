// ============================================================
// src/contexts/AuthContext.jsx
// Context untuk manajemen autentikasi pengguna
// ============================================================

import { createContext, useContext, useEffect, useState } from 'react'
import { SUPABASE_TABLES, supabase } from '../lib/supabase'

const AuthContext = createContext({})

function normalizeUsername(username) {
  return username.trim().toLowerCase()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cek session yang sudah ada
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    // Listen perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.profiles)
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    setProfile(data)
  }

  async function signUp({ namaLengkap, username, password }) {
    // Buat email sementara dari username untuk Supabase Auth
    const normalizedUsername = normalizeUsername(username)
    const normalizedNamaLengkap = namaLengkap.trim()
    const email = `${normalizedUsername}@neurostep.app`
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama_lengkap: normalizedNamaLengkap,
          username: normalizedUsername,
        },
      },
    })
    if (error) throw error

    // Simpan profil ke tabel profiles jika session langsung aktif.
    // Jika email confirmation aktif, trigger database di SUPABASE_SETUP.sql
    // tetap akan membuat profil dari metadata auth.
    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from(SUPABASE_TABLES.profiles)
        .upsert({
          id: data.user.id,
          nama_lengkap: normalizedNamaLengkap,
          username: normalizedUsername,
        })
      if (profileError) throw profileError
      await fetchProfile(data.user.id)
    }
    return data
  }

  async function signIn({ username, password }) {
    const email = `${normalizeUsername(username)}@neurostep.app`
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    fetchProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return context
}
