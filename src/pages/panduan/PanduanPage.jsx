// ============================================================
// src/pages/panduan/PanduanPage.jsx
// Halaman Panduan Pemeriksaan Kaki Harian - Tahap 4
// ============================================================

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckSquare, Square, Image, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { SUPABASE_BUCKETS, SUPABASE_TABLES, supabase } from '../../lib/supabase'
import PageHeader from '../../components/PageHeader'

export default function PanduanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    adaLuka: false,
    kakiKebas: false,
    kukuBermasalah: false,
  })
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function toggleCheck(key) {
    setForm(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleFotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB.')
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Format file harus JPG atau PNG.')
      return
    }
    setError('')
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  function hapusFoto() {
    setFoto(null)
    setFotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSimpan() {
    setLoading(true)
    setError('')
    try {
      let fotoUrl = null

      // Upload foto ke Supabase Storage jika ada
      if (foto) {
        const ext = foto.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_BUCKETS.fotoKaki)
          .upload(fileName, foto)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from(SUPABASE_BUCKETS.fotoKaki)
          .getPublicUrl(fileName)
        fotoUrl = urlData.publicUrl
      }

      // Simpan data ke tabel panduan_harian
      const { error: dbError } = await supabase.from(SUPABASE_TABLES.panduanHarian).insert({
        user_id: user.id,
        tanggal: new Date().toISOString().split('T')[0],
        ada_luka: form.adaLuka,
        kaki_kebas: form.kakiKebas,
        kuku_bermasalah: form.kukuBermasalah,
        foto_url: fotoUrl,
      })
      if (dbError) throw dbError

      setSaved(true)
    } catch (e) {
      setError('Gagal menyimpan. Coba lagi.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const checklist = [
    {
      key: 'adaLuka',
      label: 'Apakah ada luka?',
      desc: 'Periksa seluruh permukaan kaki termasuk sela jari',
      warnIfTrue: true,
    },
    {
      key: 'kakiKebas',
      label: 'Apakah kaki terasa kebas?',
      desc: 'Gangguan saraf dapat menyebabkan mati rasa',
      warnIfTrue: true,
    },
    {
      key: 'kukuBermasalah',
      label: 'Apakah kuku bermasalah?',
      desc: 'Perubahan warna, bentuk, atau tanda infeksi',
      warnIfTrue: true,
    },
  ]

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Pemeriksaan Kaki Harian" onClose={() => navigate('/dashboard')} />
        <div className="app-content flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pemeriksaan Tersimpan!</h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            Data pemeriksaan harian berhasil disimpan ke cloud.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Pemeriksaan Kaki Harian" onClose={() => navigate('/dashboard')} />

      <div className="app-content space-y-4">
        {/* Tanggal */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <p className="text-blue-700 text-sm font-medium">
            📅 {new Date().toLocaleDateString('id-ID', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Checklist Pemeriksaan Harian</h3>
          <div className="space-y-3">
            {checklist.map(({ key, label, desc, warnIfTrue }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleCheck(key)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  form[key]
                    ? warnIfTrue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {form[key]
                    ? <CheckSquare className={`w-5 h-5 ${warnIfTrue ? 'text-red-500' : 'text-green-500'}`} />
                    : <Square className="w-5 h-5 text-gray-400" />
                  }
                </span>
                <div>
                  <p className={`text-sm font-medium ${form[key] && warnIfTrue ? 'text-red-700' : 'text-gray-800'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  {form[key] && warnIfTrue && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Perlu perhatian — catat di Catatan Luka
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Foto */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Dokumentasi Foto (Opsional)</h3>

          {fotoPreview ? (
            <div className="relative">
              <img
                src={fotoPreview}
                alt="Preview kaki"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                onClick={hapusFoto}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">Klik untuk unggah foto</p>
              <p className="text-xs text-gray-400">Format: JPG/PNG (maks. 5MB)</p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFotoChange}
            className="hidden"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Tombol Simpan */}
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
          ) : 'Simpan Pemeriksaan Harian'}
        </button>
      </div>
    </div>
  )
}
