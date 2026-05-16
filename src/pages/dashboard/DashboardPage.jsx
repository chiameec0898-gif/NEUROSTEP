// ============================================================
// src/pages/dashboard/DashboardPage.jsx
// Halaman Dashboard Utama - Tahap 2
// ============================================================

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, BookOpen, Bell, GraduationCap,
  FileText, History, LogOut, ChevronRight, User
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { SUPABASE_TABLES, supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'

const menuItems = [
  {
    id: 'checklist',
    path: '/checklist',
    icon: ClipboardList,
    label: 'Checklist',
    desc: 'Pemeriksaan kaki harian',
    color: 'bg-blue-50 text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'panduan',
    path: '/panduan',
    icon: BookOpen,
    label: 'Panduan',
    desc: 'Langkah perawatan kaki',
    color: 'bg-teal-50 text-teal-600',
    iconBg: 'bg-teal-100',
  },
  {
    id: 'pengingat',
    path: '/pengingat',
    icon: Bell,
    label: 'Pengingat',
    desc: 'Jadwal perawatan & obat',
    color: 'bg-orange-50 text-orange-600',
    iconBg: 'bg-orange-100',
  },
  {
    id: 'edukasi',
    path: '/edukasi',
    icon: GraduationCap,
    label: 'Edukasi',
    desc: 'Informasi diabetes',
    color: 'bg-purple-50 text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    id: 'catatan',
    path: '/catatan',
    icon: FileText,
    label: 'Catatan',
    desc: 'Catat kondisi kaki',
    color: 'bg-pink-50 text-pink-600',
    iconBg: 'bg-pink-100',
  },
  {
    id: 'riwayat',
    path: '/riwayat',
    icon: History,
    label: 'Riwayat',
    desc: 'Lihat data sebelumnya',
    color: 'bg-gray-50 text-gray-600',
    iconBg: 'bg-gray-100',
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [statusHarian, setStatusHarian] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  const namaUser = profile?.nama_lengkap || user?.user_metadata?.nama_lengkap || 'Pengguna'

  useEffect(() => {
    fetchStatusHarian()
  }, [user])

  async function fetchStatusHarian() {
    if (!user) return
    setLoadingStatus(true)
    try {
      // Ambil pemeriksaan terakhir hari ini
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from(SUPABASE_TABLES.pemeriksaan)
        .select('tingkat_risiko, skor_risiko, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setStatusHarian(data || null)
    } catch {
      setStatusHarian(null)
    } finally {
      setLoadingStatus(false)
    }
  }

  async function handleLogout() {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  function getStatusCard() {
    if (loadingStatus) {
      return (
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-40" />
          </div>
        </div>
      )
    }

    if (!statusHarian) {
      return (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-800 text-sm">Belum Ada Pemeriksaan</p>
            <p className="text-blue-600 text-xs mt-0.5">Lakukan pemeriksaan kaki hari ini</p>
          </div>
          <button
            onClick={() => navigate('/checklist')}
            className="text-blue-600 hover:text-blue-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )
    }

    const risiko = statusHarian.tingkat_risiko
    const config = {
      rendah: {
        bg: 'bg-green-50 border-green-100',
        dot: 'bg-green-500',
        title: 'Normal',
        titleColor: 'text-green-800',
        msg: 'Kaki Anda dalam kondisi baik.',
        msgColor: 'text-green-600',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-500',
      },
      sedang: {
        bg: 'bg-yellow-50 border-yellow-100',
        dot: 'bg-yellow-500',
        title: 'Risiko Sedang',
        titleColor: 'text-yellow-800',
        msg: 'Perlu perhatian lebih. Konsultasi dokter.',
        msgColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-500',
      },
      tinggi: {
        bg: 'bg-red-50 border-red-100',
        dot: 'bg-red-500',
        title: 'Risiko Tinggi!',
        titleColor: 'text-red-800',
        msg: 'Segera hubungi dokter!',
        msgColor: 'text-red-600',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-500',
      },
    }
    const c = config[risiko] || config.rendah

    return (
      <div className={`${c.bg} border rounded-2xl p-4 flex items-center gap-3`}>
        <div className={`w-12 h-12 ${c.iconBg} rounded-full flex items-center justify-center flex-shrink-0 relative`}>
          <span className={`w-3 h-3 ${c.dot} rounded-full`} />
          <span className={`absolute w-3 h-3 ${c.dot} rounded-full animate-ping opacity-50`} />
        </div>
        <div className="flex-1">
          <p className={`font-bold text-sm ${c.titleColor}`}>{c.title}</p>
          <p className={`text-xs mt-0.5 ${c.msgColor}`}>{c.msg}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Skor: {statusHarian.skor_risiko}/100
          </p>
        </div>
        <button onClick={() => navigate('/riwayat')} className="text-gray-400 hover:text-gray-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-neurostep-gradient px-4 pt-12 pb-6 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm">Selamat datang kembali,</p>
            <h1 className="text-white text-xl font-bold">{namaUser} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/riwayat')}
              className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
              aria-label="Profil"
            >
              <User className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"
              aria-label="Keluar"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Logo kecil */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-white/80 text-xs font-medium">NEUROSTEP</span>
        </div>
      </div>

      <div className="app-content -mt-2">
        {/* Status Harian Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 animate-fade-in">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Status Hari Ini</h2>
          {getStatusCard()}
        </div>

        {/* Menu Utama */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Menu Utama</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {menuItems.map(({ id, path, icon: Icon, label, desc, iconBg }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md active:scale-95 transition-all duration-150 border border-gray-50"
            >
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-gray-400 text-xs mt-0.5 leading-tight">{desc}</p>
            </button>
          ))}
        </div>

        {/* Tanggal */}
        <p className="text-center text-xs text-gray-400 mt-6">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
