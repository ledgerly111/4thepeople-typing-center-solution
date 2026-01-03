// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

// Vite injects env vars that start with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn but don't crash if env vars missing (for demo/development)
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or anon key missing! Some features may not work.');
}

// Create client only if we have credentials, otherwise create a dummy
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
