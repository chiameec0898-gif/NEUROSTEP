// ============================================================
// src/pages/catatan/CatatanPage.jsx
// Halaman Catatan Luka - Tahap 7
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { SUPABASE_TABLES, supabase } from '../../lib/supabase'
import PageHeader from '../../components/PageHeader'

const LOKASI_OPTIONS = [
  'Telapak Kaki Kanan',
  'Telapak Kaki Kiri',
  'Sela Jari Kanan',
  'Sela Jari Kiri',
  'Tumit Kanan',
  'Tumit Kiri',
  'Punggung Kaki Kanan',
  'Punggung Kaki Kiri',
  'Sekitar Kuku Kanan',
  'Sekitar Kuku Kiri',
]

export default function CatatanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({ lokasiLuka: '', keterangan: '' })
  const [catatanList, setCatatanList] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchCatatan()
  }, [user])

  async function fetchCatatan() {
    if (!user) return
    setLoadingData(true)
    try {
      const { data, error: err } = await supabase
        .from(SUPABASE_TABLES.catatanLuka)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      setCatatanList(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingData(false)
    }
  }

  async function handleSimpan() {
    if (!form.lokasiLuka) {
      setError('Pilih lokasi luka terlebih dahulu.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from(SUPABASE_TABLES.catatanLuka).insert({
        user_id: user.id,
        lokasi_luka: form.lokasiLuka,
        keterangan: form.keterangan,
      })
      if (err) throw err
      setForm({ lokasiLuka: '', keterangan: '' })
      setShowForm(false)
      await fetchCatatan()
    } catch (e) {
      setError('Gagal menyimpan catatan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleHapus(id) {
    try {
      const { error: err } = await supabase
        .from(SUPABASE_TABLES.catatanLuka)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (err) throw err
      setCatatanList(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  function formatTanggal(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Catatan Luka" onClose={() => navigate('/dashboard')} />

      <div className="app-content space-y-4">
        {/* Tombol Tambah */}
        <button
          onClick={() => setShowForm(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Tutup Form' : 'Tambah Catatan Baru'}
        </button>

        {/* Form Tambah Catatan */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3 animate-fade-in">
            <h3 className="font-semibold text-gray-800 text-sm">Catatan Luka Baru</h3>

            {/* Lokasi Luka */}
            <div>
              <label className="input-label">Lokasi Luka</label>
              <select
                value={form.lokasiLuka}
                onChange={e => setForm(prev => ({ ...prev, lokasiLuka: e.target.value }))}
                className="input-field"
              >
                <option value="">-- Pilih Lokasi --</option>
                {LOKASI_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Keterangan */}
            <div>
              <label className="input-label">Keterangan</label>
              <textarea
                value={form.keterangan}
                onChange={e => setForm(prev => ({ ...prev, keterangan: e.target.value }))}
                placeholder="Contoh: Luka kecil 1cm, warna kemerahan, nyeri ringan..."
                rows={4}
                className="input-field resize-none"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              onClick={handleSimpan}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : 'Simpan Catatan'}
            </button>
          </div>
        )}

        {/* Daftar Catatan */}
        <div>
          <h3 className="font-semibold text-gray-700 text-sm mb-3">
            Riwayat Catatan ({catatanList.length})
          </h3>

          {loadingData ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : catatanList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm text-center">
                Belum ada catatan luka. Tambahkan catatan pertama Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {catatanList.map(catatan => (
                <div key={catatan.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🩹</span>
                        <p className="font-semibold text-gray-800 text-sm">{catatan.lokasi_luka}</p>
                      </div>
                      {catatan.keterangan && (
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{catatan.keterangan}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-2">{formatTanggal(catatan.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleHapus(catatan.id)}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                      aria-label="Hapus catatan"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
