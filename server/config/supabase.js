import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://yzpxutumszxlgxpdajyg.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_imKBFK22qpAYrU3s6mNgFQ_8L37XCtW';

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase URL or Key is missing from environment variables.');
}

// Base Supabase Client (for verifying tokens, server health, etc.)
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Creates a scoped Supabase client with the authenticated user's JWT Bearer token.
 * This ensures Postgres RLS evaluates auth.uid() as the requesting user.
 */
export const createUserSupabaseClient = (token) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
