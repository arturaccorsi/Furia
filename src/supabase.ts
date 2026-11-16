import { createClient } from '@supabase/supabase-js'

// URL e chave "anon/publishable" do projeto. Ambas são públicas por natureza:
// o que protege os dados são as regras de RLS em supabase/migrations.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
