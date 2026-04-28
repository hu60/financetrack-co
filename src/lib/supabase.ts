import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Crea el archivo .env.local',
  )
}

// El cliente sin genérico funciona correctamente con nuestros tipos manuales.
// Cuando tengas el proyecto en Supabase puedes regenerar los tipos con:
//   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.ts
// y volver a agregar el genérico: createClient<Database>(...)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
