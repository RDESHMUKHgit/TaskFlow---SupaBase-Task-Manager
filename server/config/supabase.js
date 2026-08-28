import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://yzpxutumszxlgxpdajyg.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_imKBFK22qpAYrU3s6mNgFQ_8L37XCtW';

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase URL or Key is missing from environment variables.');
}

// Initialize Supabase Client for backend queries
export const supabase = createClient(supabaseUrl, supabaseKey);
