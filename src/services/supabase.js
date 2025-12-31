// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

// Vite injects env vars that start with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safety check – will throw if you forget to set the vars
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Supabase URL or anon key missing! Check your .env file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
