
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available, else anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- STORES TABLE (all) ---');
    const { data: stores, error: storesErr } = await supabase
        .from('stores')
        .select('id, name, slug, owner_id, owner_email');
    if (storesErr) console.error('Stores error:', storesErr.message);
    else console.table(stores);

    console.log('\n--- SETTINGS TABLE (all) ---');
    const { data: settings, error: settingsErr } = await supabase
        .from('settings')
        .select('store_id, store_name, store_status');
    if (settingsErr) console.error('Settings error:', settingsErr.message);
    else console.table(settings);

    console.log('\n--- Is "canaadelivery" slug in stores? ---');
    const { data: canaa } = await supabase
        .from('stores')
        .select('*')
        .ilike('slug', '%canaa%');
    console.log(canaa?.length ? canaa : 'NOT FOUND - need to create this store!');

    console.log('\n--- Checking vercel.app URL hints from owner_email ---');
    const { data: allStores } = await supabase.from('stores').select('id, name, slug, owner_id, owner_email');
    console.log('All stores and their owner emails:');
    allStores?.forEach(s => console.log(`  - "${s.name}" (slug: ${s.slug}) -> owner_email: ${s.owner_email} | owner_id: ${s.owner_id}`));
}

diagnose();
