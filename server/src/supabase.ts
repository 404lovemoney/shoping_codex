import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

config({ path: resolve(serverRoot, '.env') })

function assertSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in server/.env')
  }

  if (!URL.canParse(supabaseUrl)) {
    throw new Error('Invalid SUPABASE_URL in server/.env. Example: https://xxxx.supabase.co')
  }

  if (supabaseKey.includes('your-supabase')) {
    throw new Error('Invalid SUPABASE_KEY in server/.env. Replace the placeholder with your Supabase anon or service role key.')
  }

  return { supabaseUrl, supabaseKey }
}

export function getSupabase() {
  const { supabaseUrl, supabaseKey } = assertSupabaseConfig()

  return createClient(supabaseUrl, supabaseKey)
}
