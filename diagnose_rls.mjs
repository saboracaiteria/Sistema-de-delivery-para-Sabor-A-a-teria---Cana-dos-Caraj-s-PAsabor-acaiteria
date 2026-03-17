
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- DETAILED STORES ---');
    const { data: stores } = await supabase.from('stores').select('id, name, slug, owner_id, owner_email');
    console.table(stores);

    console.log('--- AUTH USERS (emails only) ---');
    // Using simple query since we can't see auth.users directly easily without service_role
    // but we can check if we can sign in with one of the super admin emails? No.
    console.log('Checking Super Admin emails from constants...');
}

diagnose();
