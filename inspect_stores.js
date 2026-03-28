
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
  const tables = ['stores', 'products', 'categories', 'settings'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error on ${table}:`, error.message);
      continue;
    }
    console.log(`\n=== COLUMNS IN [${table}] ===`);
    console.log(Object.keys(data[0] || {}).join(', '));
  }

  const { data: stores, error: sError } = await supabase.from('stores').select('id, name, slug, password');
  if (sError) console.error("Error stores:", sError);
  else {
    console.log("\n=== STORES LIST ===");
    console.table(stores);
  }
}

checkStructure();
