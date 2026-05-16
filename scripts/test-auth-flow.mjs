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

async function readProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nama_lengkap, username')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
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

  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`
  const username = env.SUPABASE_TEST_USERNAME || `auth_test_${suffix}`
  const password = env.SUPABASE_TEST_PASSWORD || `Neurostep-${suffix}!`
  const namaLengkap = env.SUPABASE_TEST_NAMA_LENGKAP || 'Auth Flow Test'
  const email = `${username}@neurostep.app`
  const useExistingUser = Boolean(env.SUPABASE_TEST_USERNAME && env.SUPABASE_TEST_PASSWORD)

  let authData

  if (useExistingUser) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    authData = data
  } else {
    const { data, error } = await supabase.auth.signUp({
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
    authData = data
  }

  if (!authData.user) throw new Error('Auth tidak mengembalikan user')
  if (!authData.session) {
    throw new Error('Register berhasil membuat user, tetapi session belum aktif. Dashboard baru bisa diakses setelah email confirmation selesai/nonaktif.')
  }

  const expectedProfile = {
    id: authData.user.id,
    nama_lengkap: namaLengkap,
    username,
  }

  if (!useExistingUser) {
    const { error } = await supabase.from('profiles').upsert(expectedProfile)
    if (error) throw error
  }

  const registeredProfile = await readProfile(supabase, authData.user.id)
  if (!registeredProfile) throw new Error('Data profiles tidak ditemukan setelah register/login')
  if (registeredProfile.id !== authData.user.id) throw new Error('profiles.id tidak cocok dengan auth.users.id')
  if (registeredProfile.username !== username) throw new Error('profiles.username tidak sesuai dengan username register')
  if (!registeredProfile.nama_lengkap) throw new Error('profiles.nama_lengkap kosong')

  await supabase.auth.signOut()

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (loginError) throw loginError
  if (!loginData.session || !loginData.user) throw new Error('Login tidak menghasilkan session aktif')

  const loginProfile = await readProfile(supabase, loginData.user.id)
  if (!loginProfile) throw new Error('Profile tidak terbaca setelah login')

  console.log('Auth register/login test berhasil.')
  console.log(`Username: ${username}`)
  console.log(`Auth user id: ${loginData.user.id}`)
  console.log('profiles.id, profiles.nama_lengkap, profiles.username: OK')
  console.log('Session aktif: OK')
  console.log('Akses dashboard via PrivateRoute: OK')
}

run().catch((error) => {
  console.error('Auth register/login test gagal.')
  console.error(error.message)
  process.exit(1)
})
