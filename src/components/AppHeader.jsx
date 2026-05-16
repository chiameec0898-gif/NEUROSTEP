// ============================================================
// src/components/AppHeader.jsx
// Header logo aplikasi (digunakan di halaman auth)
// ============================================================

export default function AppHeader() {
  return (
    <div className="text-center py-8">
      {/* Logo */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
        <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none">
          {/* Ikon kaki stilisasi */}
          <ellipse cx="30" cy="42" rx="14" ry="10" fill="white" opacity="0.9"/>
          <ellipse cx="22" cy="32" rx="5" ry="8" fill="white" opacity="0.9"/>
          <ellipse cx="30" cy="30" rx="5" ry="9" fill="white"/>
          <ellipse cx="38" cy="32" rx="5" ry="8" fill="white" opacity="0.9"/>
          {/* Sinyal/gelombang */}
          <path d="M18 20 Q24 14 30 20 Q36 26 42 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
          <path d="M22 16 Q28 10 34 16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
        </svg>
      </div>

      {/* Nama Aplikasi */}
      <h1 className="text-3xl font-bold text-white tracking-wider">
        NEUROSTEP
      </h1>

      {/* Slogan */}
      <p className="text-blue-100 text-sm mt-1 font-medium">
        Perawatan kaki diabetes cerdas
      </p>
    </div>
  )
}
