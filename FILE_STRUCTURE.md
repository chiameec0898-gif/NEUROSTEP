# NEUROSTEP — Struktur File Project

```
neurostep/                          ← Root project
│
├── .env                            ← Kredensial Supabase (JANGAN di-commit)
├── .env.example                    ← Template .env untuk referensi
├── .gitignore                      ← File yang diabaikan Git
├── index.html                      ← Entry point HTML
├── package.json                    ← Dependensi & scripts npm
├── postcss.config.js               ← Konfigurasi PostCSS
├── tailwind.config.js              ← Konfigurasi Tailwind CSS
├── vite.config.js                  ← Konfigurasi Vite bundler
├── SUPABASE_SETUP.sql              ← SQL untuk setup database Supabase
├── FILE_STRUCTURE.md               ← File ini (dokumentasi struktur)
│
├── public/
│   └── favicon.svg                 ← Ikon tab browser
│
└── src/
    ├── main.jsx                    ← Entry point React + Provider
    ├── App.jsx                     ← Router utama semua halaman
    ├── index.css                   ← Global CSS + Tailwind + komponen
    │
    ├── lib/
    │   └── supabase.js             ← Inisialisasi Supabase client
    │
    ├── contexts/
    │   └── AuthContext.jsx         ← State auth global (login/logout/profil)
    │
    ├── components/
    │   ├── AppHeader.jsx           ← Header logo untuk halaman auth
    │   ├── BottomNav.jsx           ← Navigasi bawah (Dashboard/Checklist/Edukasi/Riwayat)
    │   ├── LoadingSpinner.jsx      ← Komponen loading spinner
    │   └── PageHeader.jsx          ← Header halaman dalam (judul + tombol X)
    │
    └── pages/
        ├── auth/
        │   ├── LoginPage.jsx       ← Tahap 1a: Halaman Login
        │   └── RegisterPage.jsx    ← Tahap 1b: Halaman Registrasi
        │
        ├── dashboard/
        │   └── DashboardPage.jsx   ← Tahap 2: Dashboard utama
        │
        ├── checklist/
        │   └── ChecklistPage.jsx   ← Tahap 3: Penilaian kondisi kaki
        │
        ├── panduan/
        │   └── PanduanPage.jsx     ← Tahap 4: Pemeriksaan kaki harian + foto
        │
        ├── pengingat/
        │   └── PengingatPage.jsx   ← Tahap 5: Jadwal & pengingat
        │
        ├── edukasi/
        │   └── EdukasiPage.jsx     ← Tahap 6: Edukasi kesehatan
        │
        ├── catatan/
        │   └── CatatanPage.jsx     ← Tahap 7: Catatan luka
        │
        └── riwayat/
            └── RiwayatPage.jsx     ← Tahap 8: Riwayat pemeriksaan
```

---

## Alur Data ke Supabase

| Halaman         | Tabel Supabase    | Operasi         |
|-----------------|-------------------|-----------------|
| Register        | `profiles`        | INSERT          |
| Login           | Supabase Auth     | signInWithPassword |
| Dashboard       | `pemeriksaan`     | SELECT (hari ini) |
| Checklist       | `pemeriksaan`     | INSERT          |
| Panduan         | `panduan_harian`  | INSERT + Storage upload |
| Catatan         | `catatan_luka`    | SELECT, INSERT, DELETE |
| Riwayat         | `pemeriksaan`     | SELECT (semua)  |

---

## Routing Aplikasi

| URL           | Halaman              | Akses    |
|---------------|----------------------|----------|
| `/`           | Redirect ke `/login` | Publik   |
| `/login`      | LoginPage            | Publik   |
| `/register`   | RegisterPage         | Publik   |
| `/dashboard`  | DashboardPage        | Login    |
| `/checklist`  | ChecklistPage        | Login    |
| `/panduan`    | PanduanPage          | Login    |
| `/pengingat`  | PengingatPage        | Login    |
| `/edukasi`    | EdukasiPage          | Login    |
| `/catatan`    | CatatanPage          | Login    |
| `/riwayat`    | RiwayatPage          | Login    |
