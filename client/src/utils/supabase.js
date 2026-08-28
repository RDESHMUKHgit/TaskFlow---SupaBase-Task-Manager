import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yzpxutumszxlgxpdajyg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_imKBFK22qpAYrU3s6mNgFQ_8L37XCtW';

// Supabase browser client
export const supabase = createClient(supabaseUrl, supabaseKey);
