// ============================================================
// src/lib/supabase.js
// Konfigurasi dan inisialisasi Supabase client
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const SUPABASE_TABLES = Object.freeze({
  profiles: 'profiles',
  pemeriksaan: 'pemeriksaan',
  panduanHarian: 'panduan_harian',
  catatanLuka: 'catatan_luka',
})

export const SUPABASE_BUCKETS = Object.freeze({
  fotoKaki: 'foto-kaki',
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL dan Anon Key belum dikonfigurasi. ' +
    'Pastikan file .env sudah diisi dengan benar.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Simpan session di localStorage agar tidak logout saat refresh
    persistSession: true,
    autoRefreshToken: true,
  },
})

export default supabase
