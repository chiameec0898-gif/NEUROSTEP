// ============================================================
// src/pages/pengingat/PengingatPage.jsx
// Halaman Jadwal & Pengingat - Tahap 5
// ============================================================

import { useNavigate } from 'react-router-dom'
import { Bell, Clock, Calendar, AlertCircle, Lightbulb } from 'lucide-react'
import PageHeader from '../../components/PageHeader'

const jadwalPemeriksaan = [
  {
    icon: '🦶',
    title: 'Pemeriksaan Kaki Harian',
    desc: 'Periksa kondisi kaki setiap hari',
    frekuensi: 'Setiap Hari',
    color: 'bg-blue-50 border-blue-100',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '🧴',
    title: 'Perawatan Kaki Mingguan',
    desc: 'Perawatan menyeluruh setiap minggu',
    frekuensi: 'Setiap Minggu',
    color: 'bg-teal-50 border-teal-100',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    icon: '👨‍⚕️',
    title: 'Konsultasi Dokter Rutin',
    desc: 'Kontrol kesehatan berkala',
    frekuensi: 'Setiap Bulan',
    color: 'bg-purple-50 border-purple-100',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: '🏥',
    title: 'Pemeriksaan Khusus',
    desc: 'Digunakan saat kondisi darurat',
    frekuensi: 'Jika Diperlukan',
    color: 'bg-red-50 border-red-100',
    badgeColor: 'bg-red-100 text-red-700',
  },
]

const jadwalObat = [
  {
    waktu: 'Pagi',
    jam: '06:00 – 08:00',
    desc: 'Sebelum / bersamaan sarapan',
    icon: '🌅',
    color: 'bg-orange-50 border-orange-100',
    timeColor: 'text-orange-600',
  },
  {
    waktu: 'Siang',
    jam: '12:00 – 13:00',
    desc: 'Saat makan siang',
    icon: '☀️',
    color: 'bg-yellow-50 border-yellow-100',
    timeColor: 'text-yellow-600',
  },
  {
    waktu: 'Malam',
    jam: '19:00 – 20:00',
    desc: 'Sebelum tidur',
    icon: '🌙',
    color: 'bg-indigo-50 border-indigo-100',
    timeColor: 'text-indigo-600',
  },
]

const tips = [
  { icon: '⏰', text: 'Gunakan alarm pengingat di HP Anda' },
  { icon: '📝', text: 'Catat konsumsi obat setiap hari' },
  { icon: '🦶', text: 'Periksa kaki sebelum tidur' },
  { icon: '📞', text: 'Segera hubungi dokter jika ada perubahan' },
]

export default function PengingatPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Jadwal & Pengingat" onClose={() => navigate('/dashboard')} />

      <div className="app-content space-y-5">
        {/* Jadwal Pemeriksaan Rutin */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800 text-sm">Jadwal Pemeriksaan Rutin</h3>
          </div>
          <div className="space-y-2">
            {jadwalPemeriksaan.map((item, i) => (
              <div key={i} className={`${item.color} border rounded-xl p-3 flex items-center gap-3`}>
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.badgeColor}`}>
                  {item.frekuensi}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Jadwal Minum Obat */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Jadwal Minum Obat</h3>
          </div>
          <div className="space-y-2">
            {jadwalObat.map((item, i) => (
              <div key={i} className={`${item.color} border rounded-xl p-3 flex items-center gap-3`}>
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.waktu}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <span className={`text-xs font-bold ${item.timeColor}`}>{item.jam}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Penting */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Tips Penting</h3>
          </div>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-yellow-50 rounded-xl">
                <span className="text-xl">{tip.icon}</span>
                <p className="text-sm text-gray-700">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Catatan */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Konsistensi adalah kunci. Jadwal yang teratur membantu mencegah komplikasi diabetes pada kaki.
          </p>
        </div>
      </div>
    </div>
  )
}
