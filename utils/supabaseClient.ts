import { createClient, SupabaseClient } from './supabaseLite';

function maskKey(key: string | null) {
  if (!key) return 'undefined';
  if (key.length <= 8) return `${key.slice(0, 2)}…${key.slice(-2)}`;
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  '';

const missingEnv: string[] = [];
if (!supabaseUrl) missingEnv.push('SUPABASE_URL');
if (!supabaseAnonKey) missingEnv.push('SUPABASE_ANON_KEY');

if (missingEnv.length) {
  console.warn('[Supabase] Missing environment variables at runtime:', missingEnv.join(', '));
}

let supabase: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

export const supabaseEnvDiagnostics = {
  supabaseUrl,
  supabaseAnonKeyMasked: maskKey(supabaseAnonKey),
  hasAllEnv: !!supabaseUrl && !!supabaseAnonKey,
  missingEnv,
};

export function getSupabaseClient() {
  return supabase;
}
