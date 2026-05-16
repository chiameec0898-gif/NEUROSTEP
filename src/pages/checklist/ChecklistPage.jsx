// ============================================================
// src/pages/checklist/ChecklistPage.jsx
// Halaman Checklist Pemeriksaan Kaki - Tahap 3
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, AlertTriangle, CheckCircle, AlertCircle, Phone } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { SUPABASE_TABLES, supabase } from '../../lib/supabase'
import PageHeader from '../../components/PageHeader'

const GEJALA_OPTIONS = [
  { id: 'luka_terbuka', label: 'Luka Terbuka' },
  { id: 'bengkak', label: 'Bengkak' },
  { id: 'kebas', label: 'Kebas / Mati Rasa' },
  { id: 'masalah_kuku', label: 'Masalah Kuku' },
  { id: 'kemerahan', label: 'Kemerahan' },
  { id: 'bau_tidak_sedap', label: 'Bau Tidak Sedap' },
]

function hitungRisiko({ tingkatNyeri, suhuKaki, kondisiKulit, sensitivitasSaraf, gejala, statusDm }) {
  let skor = 0

  // Nyeri (0-30 poin)
  skor += Math.round((tingkatNyeri / 10) * 30)

  // Suhu kaki (0-20 poin)
  const suhu = parseFloat(suhuKaki)
  if (!isNaN(suhu)) {
    if (suhu > 38 || suhu < 34) skor += 20
    else if (suhu > 37 || suhu < 35) skor += 10
  }

  // Kondisi kulit (0-15 poin)
  if (kondisiKulit === 'luka') skor += 15
  else if (kondisiKulit === 'kemerahan') skor += 10
  else if (kondisiKulit === 'kering') skor += 5

  // Sensitivitas saraf (0-15 poin)
  if (sensitivitasSaraf === 'tidak_ada') skor += 15
  else if (sensitivitasSaraf === 'berkurang') skor += 8

  // Gejala (0-15 poin)
  const beratGejala = { luka_terbuka: 5, bengkak: 4, kebas: 3, masalah_kuku: 2, kemerahan: 2, bau_tidak_sedap: 3 }
  gejala.forEach(g => { skor += beratGejala[g] || 0 })

  // Status DM (0-5 poin)
  if (statusDm === 'tipe1') skor += 5
  else if (statusDm === 'tipe2') skor += 3

  skor = Math.min(skor, 100)

  let tingkat = 'rendah'
  if (skor >= 60) tingkat = 'tinggi'
  else if (skor >= 30) tingkat = 'sedang'

  return { skor, tingkat }
}

export default function ChecklistPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    tanggalPeriksa: new Date().toISOString().split('T')[0],
    statusDm: 'tipe2',
    tingkatNyeri: 1,
    suhuKaki: '',
    kondisiKulit: 'normal',
    sensitivitasSaraf: 'normal',
    gejala: [],
  })
  const [hasil, setHasil] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setHasil(null)
  }

  function handleGejala(id) {
    setForm(prev => ({
      ...prev,
      gejala: prev.gejala.includes(id)
        ? prev.gejala.filter(g => g !== id)
        : [...prev.gejala, id],
    }))
    setHasil(null)
  }

  function handleCekStatus() {
    const { skor, tingkat } = hitungRisiko(form)
    setHasil({ skor, tingkat })
  }

  async function handleSimpan() {
    if (!hasil) return
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from(SUPABASE_TABLES.pemeriksaan).insert({
        user_id: user.id,
        tanggal_periksa: form.tanggalPeriksa,
        status_dm: form.statusDm,
        tingkat_nyeri: parseInt(form.tingkatNyeri),
        suhu_kaki: form.suhuKaki ? parseFloat(form.suhuKaki) : null,
        kondisi_kulit: form.kondisiKulit,
        sensitivitas_saraf: form.sensitivitasSaraf,
        gejala: form.gejala,
        skor_risiko: hasil.skor,
        tingkat_risiko: hasil.tingkat,
      })
      if (err) throw err
      setSaved(true)
    } catch (e) {
      setError('Gagal menyimpan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const risikoConfig = {
    rendah: {
      bg: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-700',
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: 'Risiko Rendah — Normal',
      titleColor: 'text-green-800',
      msg: 'Kaki Anda dalam kondisi baik. Pertahankan perawatan rutin.',
      cta: 'Lanjutkan Perawatan',
      ctaColor: 'bg-green-600 hover:bg-green-700',
      rekomendasi: [
        'Bersihkan dan keringkan kaki setiap hari',
        'Gunakan pelembap kaki',
        'Hindari berjalan tanpa alas kaki',
        'Lakukan pemeriksaan rutin setiap hari',
      ],
    },
    sedang: {
      bg: 'bg-yellow-50 border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
      title: 'Risiko Sedang — Perlu Perhatian',
      titleColor: 'text-yellow-800',
      msg: 'Kondisi kaki memerlukan perhatian lebih. Disarankan konsultasi ke dokter.',
      cta: 'Buat Janji Dokter',
      ctaColor: 'bg-yellow-600 hover:bg-yellow-700',
      rekomendasi: [
        'Bersihkan luka dengan antiseptik ringan',
        'Gunakan pelembap dan kaus kaki bersih',
        'Hindari tekanan berlebih pada kaki',
        'Segera buat janji dengan dokter',
        'Catat perkembangan kondisi setiap hari',
      ],
    },
    tinggi: {
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700',
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      title: 'Risiko Tinggi — Segera Hubungi Dokter!',
      titleColor: 'text-red-800',
      msg: 'Kondisi kaki memerlukan penanganan medis segera. Jangan tunda!',
      cta: 'Hubungi Dokter Sekarang',
      ctaColor: 'bg-red-600 hover:bg-red-700',
      rekomendasi: [
        'JANGAN melakukan perawatan sendiri',
        'Segera ke dokter atau rumah sakit terdekat',
        'Hindari aktivitas berat dan berjalan jauh',
        'Jaga luka tetap bersih dan tertutup',
        'Hubungi layanan darurat jika kondisi memburuk',
      ],
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Penilaian Kondisi Kaki" onClose={() => navigate('/dashboard')} />

      <div className="app-content space-y-4">
        {/* Informasi Dasar */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Informasi Dasar</h3>
          <div className="space-y-3">
            <div>
              <label className="input-label">Tanggal Pemeriksaan</label>
              <input
                type="date"
                name="tanggalPeriksa"
                value={form.tanggalPeriksa}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Status Diabetes Melitus</label>
              <select name="statusDm" value={form.statusDm} onChange={handleChange} className="input-field">
                <option value="tipe1">DM Tipe 1</option>
                <option value="tipe2">DM Tipe 2</option>
                <option value="gestasional">DM Gestasional</option>
                <option value="tidak_ada">Tidak Ada / Belum Terdiagnosis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Penilaian Klinis */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Penilaian Klinis</h3>
          <div className="space-y-4">
            {/* Tingkat Nyeri */}
            <div>
              <label className="input-label">
                Tingkat Nyeri: <span className="text-blue-600 font-bold">{form.tingkatNyeri}/10</span>
              </label>
              <input
                type="range"
                name="tingkatNyeri"
                min="1"
                max="10"
                value={form.tingkatNyeri}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Tidak Nyeri</span>
                <span>Sangat Nyeri</span>
              </div>
            </div>

            {/* Suhu Kaki */}
            <div>
              <label className="input-label">Suhu Kaki (°C)</label>
              <input
                type="number"
                name="suhuKaki"
                value={form.suhuKaki}
                onChange={handleChange}
                placeholder="Contoh: 36.5"
                step="0.1"
                min="30"
                max="42"
                className="input-field"
              />
            </div>

            {/* Kondisi Kulit */}
            <div>
              <label className="input-label">Kondisi Kulit</label>
              <select name="kondisiKulit" value={form.kondisiKulit} onChange={handleChange} className="input-field">
                <option value="normal">Normal</option>
                <option value="kering">Kering / Pecah-pecah</option>
                <option value="kemerahan">Kemerahan</option>
                <option value="luka">Ada Luka</option>
              </select>
            </div>

            {/* Sensitivitas Saraf */}
            <div>
              <label className="input-label">Sensitivitas Saraf</label>
              <select name="sensitivitasSaraf" value={form.sensitivitasSaraf} onChange={handleChange} className="input-field">
                <option value="normal">Normal</option>
                <option value="berkurang">Berkurang</option>
                <option value="tidak_ada">Tidak Ada (Mati Rasa)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gejala */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Gejala yang Terdeteksi</h3>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {GEJALA_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleGejala(id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  form.gejala.includes(id)
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  form.gejala.includes(id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}>
                  {form.gejala.includes(id) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tombol Cek Status */}
        <button
          onClick={handleCekStatus}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors shadow-sm"
        >
          Cek Status
        </button>

        {/* Hasil Penilaian */}
        {hasil && (() => {
          const c = risikoConfig[hasil.tingkat]
          return (
            <div className={`${c.bg} border rounded-2xl p-4 space-y-4 animate-fade-in`}>
              {/* Header Hasil */}
              <div className="flex items-start gap-3">
                {c.icon}
                <div className="flex-1">
                  <h3 className={`font-bold text-base ${c.titleColor}`}>{c.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{c.msg}</p>
                </div>
              </div>

              {/* Skor */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${c.badge}`}>
                  Skor Risiko: {hasil.skor}/100
                </span>
              </div>

              {/* Detail Kondisi */}
              <div className="bg-white/70 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-gray-600 mb-2">Detail Kondisi:</p>
                <DetailRow label="Tingkat Nyeri" value={`${form.tingkatNyeri}/10`} />
                {form.suhuKaki && <DetailRow label="Suhu Kaki" value={`${form.suhuKaki}°C`} />}
                <DetailRow label="Kondisi Kulit" value={form.kondisiKulit} />
                <DetailRow label="Sensitivitas Saraf" value={form.sensitivitasSaraf} />
                {form.gejala.length > 0 && (
                  <DetailRow label="Gejala" value={form.gejala.map(g =>
                    GEJALA_OPTIONS.find(o => o.id === g)?.label
                  ).join(', ')} />
                )}
              </div>

              {/* Rekomendasi */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Rekomendasi Perawatan:</p>
                <ul className="space-y-1.5">
                  {c.rekomendasi.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notifikasi Risiko Tinggi */}
              {hasil.tingkat === 'tinggi' && (
                <div className="bg-red-100 border border-red-300 rounded-xl p-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-xs font-medium">
                    Pesan siap dikirim ke dokter — RISIKO TINGGI
                  </p>
                </div>
              )}

              {/* Tombol Simpan & CTA */}
              {!saved ? (
                <div className="space-y-2">
                  {error && <p className="text-red-600 text-xs text-center">{error}</p>}
                  <button
                    onClick={handleSimpan}
                    disabled={loading}
                    className={`w-full py-3 text-white font-semibold rounded-2xl transition-colors ${c.ctaColor}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </span>
                    ) : c.cta}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-green-600 text-sm font-medium">✓ Data berhasil disimpan ke cloud</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-2xl transition-colors"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium capitalize">{value}</span>
    </div>
  )
}
