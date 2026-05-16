// ============================================================
// src/components/BottomNav.jsx
// Navigasi bawah untuk akses cepat ke fitur utama
// ============================================================

import { useNavigate, useLocation } from 'react-router-dom'
import { Home, ClipboardList, BookOpen, History } from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: Home,          label: 'Beranda' },
  { path: '/checklist', icon: ClipboardList, label: 'Checklist' },
  { path: '/edukasi',   icon: BookOpen,      label: 'Edukasi' },
  { path: '/riwayat',   icon: History,       label: 'Riwayat' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav-shell">
      <div className="flex">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors
                ${active
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
