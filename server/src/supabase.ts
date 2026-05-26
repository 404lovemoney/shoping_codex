import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

config({ path: resolve(serverRoot, '.env') })

function assertSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env'
    )
  }

  if (!URL.canParse(supabaseUrl)) {
    throw new Error(
      'Invalid SUPABASE_URL in server/.env. Example: https://xxxx.supabase.co'
    )
  }

  if (
    supabaseUrl.includes('your-project-ref')
    || supabaseUrl.includes('placeholder')
    || supabaseKey.includes('your-')
    || supabaseKey.includes('placeholder')
  ) {
    throw new Error(
      'Invalid Supabase config in server/.env'
    )
  }

  return { supabaseUrl, supabaseKey }
}

export function hasSupabaseConfig() {
  try {
    assertSupabaseConfig()
    return true
  }
  catch {
    return false
  }
}

export function getSupabase() {
  const { supabaseUrl, supabaseKey } = assertSupabaseConfig()

  return createClient(supabaseUrl, supabaseKey)
}
