// ============================================================
// src/pages/edukasi/EdukasiPage.jsx
// Halaman Edukasi Kesehatan - Tahap 6
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import PageHeader from '../../components/PageHeader'

const tabs = ['Pencegahan', 'Perawatan Luka', 'Penggunaan Salep']

const kontenEdukasi = {
  'Pencegahan': {
    intro: 'Mencegah lebih baik daripada mengobati. Perawatan yang tepat dapat menghindari komplikasi serius seperti ulkus kaki diabetes.',
    materi: [
      {
        icon: '🩸',
        judul: 'Kontrol Gula Darah',
        isi: 'Jaga kadar gula darah dalam batas normal (80–130 mg/dL sebelum makan, <180 mg/dL setelah makan). Gula darah tinggi merusak pembuluh darah dan saraf kaki.',
      },
      {
        icon: '🧴',
        judul: 'Perawatan Kulit Harian',
        isi: 'Cuci kaki dengan air hangat (bukan panas) setiap hari. Keringkan dengan lembut terutama di sela jari. Gunakan pelembap untuk mencegah kulit kering dan pecah-pecah.',
      },
      {
        icon: '👟',
        judul: 'Pemilihan Alas Kaki',
        isi: 'Gunakan sepatu yang pas, tidak terlalu sempit atau longgar. Pilih bahan yang lembut dan bernapas. Selalu gunakan kaus kaki bersih. Hindari berjalan tanpa alas kaki.',
      },
      {
        icon: '✂️',
        judul: 'Perawatan Kuku',
        isi: 'Potong kuku lurus, jangan terlalu pendek. Kikir ujung kuku yang tajam. Jangan memotong kuku yang terlalu dalam di sudut untuk mencegah kuku tumbuh ke dalam.',
      },
      {
        icon: '⚠️',
        judul: 'Hindari Cedera',
        isi: 'Periksa bagian dalam sepatu sebelum dipakai. Hindari sumber panas langsung (bantal pemanas, air panas). Jangan gunakan benda tajam untuk membersihkan kaki.',
      },
      {
        icon: '🥗',
        judul: 'Gaya Hidup Sehat',
        isi: 'Konsumsi makanan bergizi seimbang, rendah gula dan lemak jenuh. Olahraga ringan seperti jalan kaki 30 menit/hari. Berhenti merokok karena merusak sirkulasi darah.',
      },
    ],
  },
  'Perawatan Luka': {
    intro: 'Luka pada kaki diabetik harus ditangani dengan benar untuk mencegah infeksi dan komplikasi lebih lanjut.',
    materi: [
      {
        icon: '🧼',
        judul: 'Membersihkan Luka',
        isi: 'Bersihkan luka dengan air bersih mengalir atau larutan saline (NaCl 0,9%). Hindari alkohol atau hidrogen peroksida karena dapat merusak jaringan baru.',
      },
      {
        icon: '🩹',
        judul: 'Menutup Luka',
        isi: 'Tutup luka dengan perban steril yang bersih. Ganti perban setiap hari atau saat basah/kotor. Pastikan perban tidak terlalu ketat.',
      },
      {
        icon: '🔍',
        judul: 'Memantau Tanda Infeksi',
        isi: 'Waspadai tanda infeksi: kemerahan meluas, bengkak, panas, nanah, atau bau tidak sedap. Jika ada tanda infeksi, segera ke dokter.',
      },
      {
        icon: '🚫',
        judul: 'Yang Harus Dihindari',
        isi: 'Jangan memecahkan lepuhan sendiri. Jangan menggunakan obat tradisional tanpa saran dokter. Jangan membiarkan luka terbuka tanpa penutup.',
      },
    ],
  },
  'Penggunaan Salep': {
    intro: 'Penggunaan salep yang tepat membantu proses penyembuhan luka dan menjaga kelembapan kulit kaki.',
    materi: [
      {
        icon: '💊',
        judul: 'Salep Antibiotik',
        isi: 'Digunakan untuk luka dengan risiko infeksi. Contoh: salep yang mengandung bacitracin atau neomycin. Gunakan sesuai petunjuk dokter, jangan berlebihan.',
      },
      {
        icon: '🧴',
        judul: 'Pelembap Kaki',
        isi: 'Gunakan pelembap berbahan urea 10–25% untuk kulit kaki yang sangat kering. Oleskan setelah mandi saat kulit masih sedikit lembap. Hindari sela jari kaki.',
      },
      {
        icon: '🌿',
        judul: 'Salep Penyembuh Luka',
        isi: 'Salep berbahan zinc oxide atau silver sulfadiazine membantu penyembuhan luka. Selalu konsultasikan dengan dokter atau apoteker sebelum menggunakan.',
      },
      {
        icon: '⚕️',
        judul: 'Konsultasi Dokter',
        isi: 'Untuk luka yang dalam, tidak sembuh dalam 1–2 minggu, atau menunjukkan tanda infeksi, segera konsultasikan ke dokter. Jangan mengandalkan salep saja.',
      },
    ],
  },
}

export default function EdukasiPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Pencegahan')

  const konten = kontenEdukasi[activeTab]

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="Edukasi Kesehatan" onClose={() => navigate('/dashboard')} />

      {/* Tab Navigasi */}
      <div className="bg-white border-b border-gray-100 px-4 pt-2 md:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="app-content space-y-4">
        {/* Intro */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <GraduationCap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">{konten.intro}</p>
        </div>

        {/* Materi */}
        <div className="space-y-3">
          {konten.materi.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.judul}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.isi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
