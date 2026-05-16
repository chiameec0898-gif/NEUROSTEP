// ============================================================
// src/App.jsx
// Router utama aplikasi NEUROSTEP
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Halaman Auth
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Halaman Utama
import DashboardPage from './pages/dashboard/DashboardPage'
import ChecklistPage from './pages/checklist/ChecklistPage'
import PanduanPage from './pages/panduan/PanduanPage'
import PengingatPage from './pages/pengingat/PengingatPage'
import EdukasiPage from './pages/edukasi/EdukasiPage'
import CatatanPage from './pages/catatan/CatatanPage'
import RiwayatPage from './pages/riwayat/RiwayatPage'

// Guard: redirect ke login jika belum login
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// Guard: redirect ke dashboard jika sudah login
function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <div className="page-container">
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Halaman publik (auth) */}
        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><RegisterPage /></PublicRoute>
        } />

        {/* Halaman privat (butuh login) */}
        <Route path="/dashboard" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />
        <Route path="/checklist" element={
          <PrivateRoute><ChecklistPage /></PrivateRoute>
        } />
        <Route path="/panduan" element={
          <PrivateRoute><PanduanPage /></PrivateRoute>
        } />
        <Route path="/pengingat" element={
          <PrivateRoute><PengingatPage /></PrivateRoute>
        } />
        <Route path="/edukasi" element={
          <PrivateRoute><EdukasiPage /></PrivateRoute>
        } />
        <Route path="/catatan" element={
          <PrivateRoute><CatatanPage /></PrivateRoute>
        } />
        <Route path="/riwayat" element={
          <PrivateRoute><RiwayatPage /></PrivateRoute>
        } />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}
