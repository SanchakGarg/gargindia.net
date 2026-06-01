import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const noStore = (url: RequestInfo | URL, init?: RequestInit) =>
  fetch(url, { ...init, cache: 'no-store' })

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: noStore },
})
