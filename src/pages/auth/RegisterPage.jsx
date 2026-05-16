// ============================================================
// src/pages/auth/RegisterPage.jsx
// Halaman Registrasi - Tahap 1b
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Lock, UserCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AppHeader from '../../components/AppHeader'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [form, setForm] = useState({
    namaLengkap: '',
    username: '',
    password: '',
    konfirmasiPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showKonfirmasi, setShowKonfirmasi] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const namaLengkap = form.namaLengkap.trim()
    const username = form.username.trim().toLowerCase()
    const { password, konfirmasiPassword } = form

    if (!namaLengkap || !username || !password || !konfirmasiPassword) {
      setError('Semua kolom wajib diisi.')
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Username hanya boleh berisi huruf kecil, angka, dan underscore.')
      return
    }
    if (username.length < 3) {
      setError('Username minimal 3 karakter.')
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (password !== konfirmasiPassword) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }

    setLoading(true)
    try {
      const data = await signUp({ namaLengkap, username, password })
      if (data.session) {
        navigate('/dashboard')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error('Register error:', err)
      const message = err.message || ''
      if (message.includes('already registered') || message.includes('already exists') || message.includes('User already registered')) {
        setError('Username sudah digunakan. Coba username lain.')
      } else if (message.includes('rate limit')) {
        setError('Pendaftaran sedang dibatasi sementara oleh Supabase. Coba lagi beberapa saat lagi.')
      } else if (message.includes('row-level security')) {
        setError('Akun dibuat, tetapi profil belum tersimpan. Jalankan ulang SUPABASE_SETUP.sql di Supabase.')
      } else {
        setError(`Gagal membuat akun: ${message || 'Silakan coba lagi.'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-neurostep-gradient">
        <AppHeader />
        <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10 flex flex-col items-center justify-center animate-slide-up md:px-8">
          <div className="auth-panel flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akun Berhasil Dibuat!</h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            Selamat bergabung di NEUROSTEP. Silakan masuk dengan akun baru Anda.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Masuk Sekarang
          </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-neurostep-gradient">
      <AppHeader />

      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10 animate-slide-up overflow-y-auto md:px-8">
        <div className="auth-panel">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Buat Akun Baru</h2>
        <p className="text-gray-500 text-sm mb-6">Daftar untuk mulai memantau kesehatan kaki Anda</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="input-label">Nama Lengkap</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="namaLengkap"
                value={form.namaLengkap}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className="input-field pl-10"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="input-label">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Buat username unik"
                className="input-field pl-10"
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                className="input-field pl-10 pr-10"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="input-label">Konfirmasi Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showKonfirmasi ? 'text' : 'password'}
                name="konfirmasiPassword"
                value={form.konfirmasiPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                className="input-field pl-10 pr-10"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowKonfirmasi(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showKonfirmasi ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Tombol Buat Akun */}
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Membuat Akun...
              </span>
            ) : 'Buat Akun'}
          </button>
        </form>

        {/* Kembali ke Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">Sudah punya akun?</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-1 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
          >
            Kembali ke Login
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
