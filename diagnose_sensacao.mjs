import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkStore() {
  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('id, name, slug, owner_email, owner_id, password')
    .eq('slug', 'sensacao-')
    .single();

  if (storeErr) {
    console.error('Error fetching store:', storeErr.message);
    return;
  }

  console.log('--- Store Data ---');
  console.log(JSON.stringify(store, null, 2));

  console.log('\n--- Attempting Login ---');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: store.owner_email,
    password: store.password
  });

  if (authErr) {
    console.error('Login failed:', authErr.message);
    console.log('This usually means the user record DOES NOT exist in auth.users');
  } else {
    console.log('Login success!');
    console.log('Auth UID:', authData.user.id);
    if (authData.user.id === store.owner_id) {
      console.log('✅ UID Matches store.owner_id');
    } else {
      console.log('❌ UID MISMATCH!');
      console.log(`Auth UID is ${authData.user.id}, but store.owner_id is ${store.owner_id}`);
    }
    await supabase.auth.signOut();
  }
}

checkStore();
