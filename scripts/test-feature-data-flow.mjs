import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv(path = '.env') {
  const env = {}
  const file = readFileSync(path, 'utf8')

  for (const rawLine of file.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separator = line.indexOf('=')
    if (separator === -1) continue

    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
    env[key] = value
  }

  return env
}

function requireEnv(env, key) {
  if (!env[key]) throw new Error(`${key} belum tersedia di .env`)
  return env[key]
}

async function getSessionUser(supabase, env) {
  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`
  const username = env.SUPABASE_TEST_USERNAME || `fitur_test_${suffix}`
  const password = env.SUPABASE_TEST_PASSWORD || `Neurostep-${suffix}!`
  const namaLengkap = env.SUPABASE_TEST_NAMA_LENGKAP || 'Feature Flow Test'
  const email = `${username}@neurostep.app`
  const useExistingUser = Boolean(env.SUPABASE_TEST_USERNAME && env.SUPABASE_TEST_PASSWORD)

  const { data, error } = useExistingUser
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama_lengkap: namaLengkap,
          username,
        },
      },
    })

  if (error) throw error
  if (!data.user) throw new Error('Auth tidak mengembalikan user')
  if (!data.session) throw new Error('User belum punya session aktif. Nonaktifkan email confirmation atau pakai akun test yang sudah terverifikasi.')

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    nama_lengkap: namaLengkap,
    username,
  })
  if (profileError) throw profileError

  return { user: data.user, username }
}

async function run() {
  const env = loadEnv()
  const supabase = createClient(
    requireEnv(env, 'VITE_SUPABASE_URL'),
    requireEnv(env, 'VITE_SUPABASE_ANON_KEY'),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )

  const { user, username } = await getSessionUser(supabase, env)
  const marker = `codex-feature-test-${Date.now()}`
  const today = new Date().toISOString().split('T')[0]

  const { data: pemeriksaanData, error: pemeriksaanError } = await supabase
    .from('pemeriksaan')
    .insert({
      user_id: user.id,
      tanggal_periksa: today,
      status_dm: 'tipe2',
      tingkat_nyeri: 3,
      suhu_kaki: 36.7,
      kondisi_kulit: 'kemerahan',
      sensitivitas_saraf: 'normal',
      gejala: ['kemerahan'],
      skor_risiko: 24,
      tingkat_risiko: 'rendah',
    })
    .select('id, skor_risiko, tingkat_risiko')
    .single()
  if (pemeriksaanError) throw pemeriksaanError

  const pngBytes = Uint8Array.from([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
    0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137,
    0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 248, 255, 255, 63,
    0, 5, 254, 2, 254, 167, 53, 129, 132, 0, 0, 0, 0, 73, 69,
    78, 68, 174, 66, 96, 130,
  ])
  const filePath = `${user.id}/${marker}.png`
  const { error: uploadError } = await supabase.storage
    .from('foto-kaki')
    .upload(filePath, pngBytes, {
      contentType: 'image/png',
      upsert: false,
    })
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from('foto-kaki').getPublicUrl(filePath)

  const { data: panduanData, error: panduanError } = await supabase
    .from('panduan_harian')
    .insert({
      user_id: user.id,
      tanggal: today,
      ada_luka: true,
      kaki_kebas: false,
      kuku_bermasalah: true,
      foto_url: urlData.publicUrl,
    })
    .select('id, foto_url')
    .single()
  if (panduanError) throw panduanError

  const { data: catatanData, error: catatanError } = await supabase
    .from('catatan_luka')
    .insert({
      user_id: user.id,
      lokasi_luka: 'Telapak Kaki Kanan',
      keterangan: marker,
    })
    .select('id, keterangan')
    .single()
  if (catatanError) throw catatanError

  const [riwayatPemeriksaan, riwayatPanduan, riwayatCatatan] = await Promise.all([
    supabase
      .from('pemeriksaan')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('panduan_harian')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('catatan_luka')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  if (riwayatPemeriksaan.error) throw riwayatPemeriksaan.error
  if (riwayatPanduan.error) throw riwayatPanduan.error
  if (riwayatCatatan.error) throw riwayatCatatan.error

  const hasPemeriksaan = riwayatPemeriksaan.data.some(item => item.id === pemeriksaanData.id)
  const hasPanduan = riwayatPanduan.data.some(item => item.id === panduanData.id)
  const hasCatatan = riwayatCatatan.data.some(item => item.id === catatanData.id)

  if (!hasPemeriksaan) throw new Error('Data pemeriksaan tidak muncul pada query riwayat')
  if (!hasPanduan) throw new Error('Data panduan harian tidak muncul pada query riwayat')
  if (!hasCatatan) throw new Error('Data catatan luka tidak muncul pada query riwayat')

  console.log('Feature data flow test berhasil.')
  console.log(`User: ${username}`)
  console.log('Insert pemeriksaan: OK')
  console.log('Upload foto-kaki: OK')
  console.log('Insert panduan_harian: OK')
  console.log('Insert catatan_luka: OK')
  console.log('Query riwayat pemeriksaan, panduan harian, dan catatan luka: OK')
}

run().catch((error) => {
  console.error('Feature data flow test gagal.')
  console.error(error.message)
  process.exit(1)
})
