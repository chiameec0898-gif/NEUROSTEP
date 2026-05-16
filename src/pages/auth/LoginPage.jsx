// ============================================================
// src/pages/auth/LoginPage.jsx
// Halaman Login - Tahap 1a
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AppHeader from '../../components/AppHeader'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Username dan password wajib diisi.')
      return
    }
    setLoading(true)
    try {
      await signIn({ username: form.username.trim().toLowerCase(), password: form.password })
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('Username atau password salah. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neurostep-gradient">
      {/* Header Logo */}
      <AppHeader />

      {/* Form Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10 animate-slide-up md:px-8">
        <div className="auth-panel">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Selamat Datang</h2>
        <p className="text-gray-500 text-sm mb-6">Masuk ke akun NEUROSTEP Anda</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Masukkan username"
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
                placeholder="Masukkan password"
                className="input-field pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : 'Masuk'}
          </button>
        </form>

        {/* Daftar Akun Baru */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">Belum punya akun?</p>
          <button
            onClick={() => navigate('/register')}
            className="mt-1 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
          >
            Daftar Akun Baru
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
