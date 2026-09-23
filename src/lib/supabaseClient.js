import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const BUSINESS_SLUG = import.meta.env.VITE_BUSINESS_SLUG
export const isSupabaseConfigured = Boolean(url && anonKey && BUSINESS_SLUG)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and VITE_BUSINESS_SLUG in .env',
  )
}

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null

export const PRODUCT_IMAGES_BUCKET = 'product-images'
