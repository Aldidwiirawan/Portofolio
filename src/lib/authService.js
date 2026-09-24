import { supabase } from './supabaseClient'

/**
 * Melakukan sign in menggunakan email dan password melalui Supabase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data: import('@supabase/supabase-js').AuthTokenResponsePassword['data'], error: import('@supabase/supabase-js').AuthError | null }>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

/**
 * Melakukan sign out pengguna dari sesi Supabase Auth saat ini
 * @returns {Promise<{ error: import('@supabase/supabase-js').AuthError | null }>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Mengambil informasi user yang sedang login saat ini dari Supabase Auth
 * @returns {Promise<{ user: import('@supabase/supabase-js').User | null, error: import('@supabase/supabase-js').AuthError | null }>}
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  return { user: data?.user ?? null, error }
}

/**
 * Memasang pendengar (listener) perubahan status autentikasi
 * @param {(event: string, session: import('@supabase/supabase-js').Session | null) => void} callback
 * @returns {import('@supabase/supabase-js').Subscription}
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription
}
