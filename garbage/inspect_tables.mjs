import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yzpxutumszxlgxpdajyg.supabase.co';
const supabaseKey = 'sb_publishable_imKBFK22qpAYrU3s6mNgFQ_8L37XCtW';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTables() {
  const commonNames = ['todos', 'tasks', 'items', 'task', 'todo', 'task_items', 'projects'];
  for (const name of commonNames) {
    const { data, error } = await supabase.from(name).select('*').limit(1);
    if (!error) {
      console.log(`Table found: ${name}`, data);
    } else {
      console.log(`Table '${name}' error:`, error.message);
    }
  }
}

inspectTables();
