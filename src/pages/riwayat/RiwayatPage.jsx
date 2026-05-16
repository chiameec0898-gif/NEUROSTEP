// ============================================================
// src/pages/riwayat/RiwayatPage.jsx
// Halaman Riwayat Pemeriksaan & Status Harian - Tahap 8
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, AlertTriangle, CheckCircle, AlertCircle, ClipboardList, BookOpen, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { SUPABASE_TABLES, supabase } from '../../lib/supabase'
import PageHeader from '../../components/PageHeader'

const GEJALA_LABELS = {
  luka_terbuka: 'Luka Terbuka',
  bengkak: 'Bengkak',
  kebas: 'Kebas',
  masalah_kuku: 'Masalah Kuku',
  kemerahan: 'Kemerahan',
  bau_tidak_sedap: 'Bau Tidak Sedap',
}

const risikoConfig = {
  rendah: {
    bg: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    label: 'Normal',
    dotColor: 'bg-green-500',
  },
  sedang: {
    bg: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    label: 'Risiko Sedang',
    dotColor: 'bg-yellow-500',
  },
  tinggi: {
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    label: 'Risiko Tinggi',
    dotColor: 'bg-red-500',
  },
}

export default function RiwayatPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [riwayat, setRiwayat] = useState([])
  const [panduanHarian, setPanduanHarian] = useState([])
  const [catatanLuka, setCatatanLuka] = useState([])
  const [statusHariIni, setStatusHariIni] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRiwayat()
  }, [user])

  async function fetchRiwayat() {
    if (!user) return
    setLoading(true)
    try {
      const [pemeriksaanResult, panduanResult, catatanResult] = await Promise.all([
        supabase
          .from(SUPABASE_TABLES.pemeriksaan)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from(SUPABASE_TABLES.panduanHarian)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from(SUPABASE_TABLES.catatanLuka)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
      ])

      if (pemeriksaanResult.error) throw pemeriksaanResult.error
      if (panduanResult.error) throw panduanResult.error
      if (catatanResult.error) throw catatanResult.error

      const pemeriksaanData = pemeriksaanResult.data || []
      setRiwayat(pemeriksaanData)
      setPanduanHarian(panduanResult.data || [])
      setCatatanLuka(catatanResult.data || [])

      // Status hari ini = pemeriksaan terbaru hari ini
      const today = new Date().toISOString().split('T')[0]
      const hariIni = pemeriksaanData.find(d =>
        d.created_at?.startsWith(today)
      )
      setStatusHariIni(hariIni || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function formatTanggal(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function labelDm(val) {
    const map = { tipe1: 'DM Tipe 1', tipe2: 'DM Tipe 2', gestasional: 'DM Gestasional', tidak_ada: 'Tidak Ada' }
    return map[val] || val
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Riwayat Pemeriksaan" onClose={() => navigate('/dashboard')} />

      <div className="app-content space-y-4">
        {/* Status Hari Ini */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Status Hari Ini</h3>

          {loading ? (
            <div className="animate-pulse h-16 bg-gray-100 rounded-xl" />
          ) : statusHariIni ? (
            (() => {
              const c = risikoConfig[statusHariIni.tingkat_risiko] || risikoConfig.rendah
              return (
                <div className={`${c.bg} border rounded-xl p-3 flex items-center gap-3`}>
                  <div className="relative">
                    {c.icon}
                    <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 ${c.dotColor} rounded-full animate-ping opacity-60`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-800">{c.label}</p>
                    <p className="text-xs text-gray-500">Skor: {statusHariIni.skor_risiko}/100</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.badge}`}>
                    {statusHariIni.skor_risiko}/100
                  </span>
                </div>
              )
            })()
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-800">Belum Ada Pemeriksaan Hari Ini</p>
                <p className="text-xs text-blue-600">Lakukan pemeriksaan untuk melihat status</p>
              </div>
              <button
                onClick={() => navigate('/checklist')}
                className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium"
              >
                Periksa
              </button>
            </div>
          )}

          {/* Peringatan risiko tinggi */}
          {statusHariIni?.tingkat_risiko === 'tinggi' && (
            <div className="mt-3 bg-red-100 border border-red-300 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-xs font-medium">
                Kondisi serius terdeteksi! Segera hubungi dokter atau ke rumah sakit.
              </p>
            </div>
          )}
        </div>

        {/* Riwayat Pemeriksaan */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-700 text-sm">
              Riwayat Pemeriksaan ({riwayat.length})
            </h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : riwayat.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <History className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm text-center">
                Belum ada riwayat pemeriksaan. Mulai pemeriksaan pertama Anda.
              </p>
              <button
                onClick={() => navigate('/checklist')}
                className="btn-primary mt-2"
              >
                Mulai Pemeriksaan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {riwayat.map(item => {
                const c = risikoConfig[item.tingkat_risiko] || risikoConfig.rendah
                return (
                  <div key={item.id} className={`${c.bg} border rounded-2xl p-4`}>
                    {/* Header Card */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {c.icon}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                          {c.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTanggal(item.created_at)}</span>
                    </div>

                    {/* Detail Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <RiwayatRow label="Skor Risiko" value={`${item.skor_risiko}/100`} />
                      <RiwayatRow label="Status DM" value={labelDm(item.status_dm)} />
                      <RiwayatRow label="Kondisi Kulit" value={item.kondisi_kulit} />
                      <RiwayatRow label="Sensitivitas" value={item.sensitivitas_saraf} />
                      <RiwayatRow label="Tingkat Nyeri" value={`${item.tingkat_nyeri}/10`} />
                      {item.suhu_kaki && (
                        <RiwayatRow label="Suhu Kaki" value={`${item.suhu_kaki}°C`} />
                      )}
                    </div>

                    {/* Gejala */}
                    {item.gejala?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-black/5">
                        <p className="text-xs text-gray-500 mb-1">Gejala:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.gejala.map(g => (
                            <span key={g} className="text-xs bg-white/70 text-gray-700 px-2 py-0.5 rounded-full border border-black/10">
                              {GEJALA_LABELS[g] || g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Riwayat Panduan Harian */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-700 text-sm">
              Riwayat Panduan Harian ({panduanHarian.length})
            </h3>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ) : panduanHarian.length === 0 ? (
            <EmptyState text="Belum ada pemeriksaan kaki harian." />
          ) : (
            <div className="space-y-3">
              {panduanHarian.map(item => (
                <div key={item.id} className="bg-white border border-teal-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                      Panduan Harian
                    </span>
                    <span className="text-xs text-gray-500">{formatTanggal(item.created_at)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <RiwayatRow label="Ada Luka" value={item.ada_luka ? 'Ya' : 'Tidak'} />
                    <RiwayatRow label="Kaki Kebas" value={item.kaki_kebas ? 'Ya' : 'Tidak'} />
                    <RiwayatRow label="Kuku Bermasalah" value={item.kuku_bermasalah ? 'Ya' : 'Tidak'} />
                    <RiwayatRow label="Foto" value={item.foto_url ? 'Ada' : 'Tidak Ada'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Riwayat Catatan Luka */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-700 text-sm">
              Riwayat Catatan Luka ({catatanLuka.length})
            </h3>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ) : catatanLuka.length === 0 ? (
            <EmptyState text="Belum ada catatan luka." />
          ) : (
            <div className="space-y-3">
              {catatanLuka.map(item => (
                <div key={item.id} className="bg-white border border-pink-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                      Catatan Luka
                    </span>
                    <span className="text-xs text-gray-500">{formatTanggal(item.created_at)}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{item.lokasi_luka}</p>
                  {item.keterangan && (
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.keterangan}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}

function RiwayatRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-gray-800 capitalize">{value}</p>
    </div>
  )
}
