import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.BUN_PUBLIC_VITE_SUPABASE_URL!,
    process.env.BUN_PUBLIC_VITE_SUPABASE_PUBLISHABLE_KEY!
  )
}
