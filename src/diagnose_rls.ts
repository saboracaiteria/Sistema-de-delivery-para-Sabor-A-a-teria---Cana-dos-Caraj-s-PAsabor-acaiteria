
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- DIAGNOSIS START ---');

    // 1. Fetch all stores
    const { data: stores, error: storesErr } = await supabase
        .from('stores')
        .select('id, name, slug, owner_id, owner_email');

    if (storesErr) {
        console.error('Error fetching stores:', storesErr.message);
    } else {
        console.log('STORES:');
        console.table(stores);
    }

    // 2. Fetch all settings
    const { data: settings, error: settingsErr } = await supabase
        .from('settings')
        .select('store_id, store_name');

    if (settingsErr) {
        console.error('Error fetching settings:', settingsErr.message);
    } else {
        console.log('SETTINGS:');
        console.table(settings);
    }

    // 3. Check for orphaned settings or missing settings
    if (stores && settings) {
        const storeIds = new Set(stores.map(s => s.id));
        const settingsStoreIds = new Set(settings.map(s => s.store_id));

        const storesWithoutSettings = stores.filter(s => !settingsStoreIds.has(s.id));
        const settingsWithoutStores = settings.filter(s => !storeIds.has(s.store_id));

        console.log('Stores missing settings:', storesWithoutSettings.map(s => s.slug));
        console.log('Settings missing stores:', settingsWithoutStores.map(s => s.store_id));
    }

    console.log('--- DIAGNOSIS END ---');
}

diagnose();
