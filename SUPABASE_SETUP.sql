-- ============================================================
-- NEUROSTEP - Database Schema untuk Supabase
-- ============================================================
-- CARA PENGGUNAAN:
-- 1. Buka https://supabase.com → masuk ke project kamu
-- 2. Klik "SQL Editor" di sidebar kiri
-- 3. Klik "New query"
-- 4. Copy-paste SELURUH isi file ini
-- 5. Klik tombol "Run" (atau tekan Ctrl+Enter)
-- ============================================================

-- ============================================================
-- TABEL 1: profiles
-- Menyimpan data profil pengguna (nama, username)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nama_lengkap  TEXT NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Sinkronisasi otomatis profil dari Supabase Auth.
-- Metadata dikirim dari RegisterPage melalui AuthContext:
-- nama_lengkap -> profiles.nama_lengkap
-- username     -> profiles.username
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
    SET nama_lengkap = EXCLUDED.nama_lengkap,
        username = EXCLUDED.username;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- ============================================================
-- TABEL 2: pemeriksaan
-- Menyimpan hasil checklist penilaian kondisi kaki (Tahap 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS pemeriksaan (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tanggal_periksa     DATE NOT NULL,
  status_dm           TEXT NOT NULL,
  tingkat_nyeri       INTEGER NOT NULL CHECK (tingkat_nyeri BETWEEN 1 AND 10),
  suhu_kaki           NUMERIC(4,1),
  kondisi_kulit       TEXT NOT NULL,
  sensitivitas_saraf  TEXT NOT NULL,
  gejala              TEXT[] DEFAULT '{}',
  skor_risiko         INTEGER NOT NULL DEFAULT 0,
  tingkat_risiko      TEXT NOT NULL CHECK (tingkat_risiko IN ('rendah','sedang','tinggi')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABEL 3: panduan_harian
-- Menyimpan hasil pemeriksaan kaki harian + foto (Tahap 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS panduan_harian (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tanggal          DATE NOT NULL,
  ada_luka         BOOLEAN DEFAULT FALSE,
  kaki_kebas       BOOLEAN DEFAULT FALSE,
  kuku_bermasalah  BOOLEAN DEFAULT FALSE,
  foto_url         TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABEL 4: catatan_luka
-- Menyimpan catatan detail kondisi luka (Tahap 7)
-- ============================================================
CREATE TABLE IF NOT EXISTS catatan_luka (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lokasi_luka  TEXT NOT NULL,
  keterangan   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Setiap pengguna hanya bisa mengakses data miliknya sendiri
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pemeriksaan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE panduan_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE catatan_luka   ENABLE ROW LEVEL SECURITY;

-- Policy: profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policy: pemeriksaan
DROP POLICY IF EXISTS "Users can view own pemeriksaan" ON pemeriksaan;
CREATE POLICY "Users can view own pemeriksaan"
  ON pemeriksaan FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pemeriksaan" ON pemeriksaan;
CREATE POLICY "Users can insert own pemeriksaan"
  ON pemeriksaan FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: panduan_harian
DROP POLICY IF EXISTS "Users can view own panduan" ON panduan_harian;
CREATE POLICY "Users can view own panduan"
  ON panduan_harian FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own panduan" ON panduan_harian;
CREATE POLICY "Users can insert own panduan"
  ON panduan_harian FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: catatan_luka
DROP POLICY IF EXISTS "Users can view own catatan" ON catatan_luka;
CREATE POLICY "Users can view own catatan"
  ON catatan_luka FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own catatan" ON catatan_luka;
CREATE POLICY "Users can insert own catatan"
  ON catatan_luka FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own catatan" ON catatan_luka;
CREATE POLICY "Users can delete own catatan"
  ON catatan_luka FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET untuk foto kaki (Tahap 4 - Panduan)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('foto-kaki', 'foto-kaki', true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Users can upload foto" ON storage.objects;
CREATE POLICY "Users can upload foto"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'foto-kaki'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Public can view foto" ON storage.objects;
CREATE POLICY "Public can view foto"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'foto-kaki');

-- ============================================================
-- SELESAI! Semua tabel dan policy berhasil dibuat.
-- Kembali ke aplikasi dan isi file .env dengan kredensial Supabase.
-- ============================================================
