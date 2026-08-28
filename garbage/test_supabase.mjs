import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yzpxutumszxlgxpdajyg.supabase.co';
const supabaseKey = 'sb_publishable_imKBFK22qpAYrU3s6mNgFQ_8L37XCtW';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase connection...');
  const { data: todos, error: todosErr } = await supabase.from('todos').select('*');
  console.log('todos table query result:', { todos, todosErr });

  const { data: tasks, error: tasksErr } = await supabase.from('tasks').select('*');
  console.log('tasks table query result:', { tasks, tasksErr });
}

test();
