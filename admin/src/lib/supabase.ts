import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const noStore = (url: RequestInfo | URL, init?: RequestInit) =>
  fetch(url, { ...init, cache: 'no-store' })

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: noStore },
})

export function createSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: noStore },
  })
}
