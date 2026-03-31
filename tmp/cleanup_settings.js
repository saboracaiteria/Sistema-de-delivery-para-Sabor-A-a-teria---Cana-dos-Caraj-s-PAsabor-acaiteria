import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Read .env.local manually if it exists
if (fs.existsSync('.env.local')) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars:", { supabaseUrl, supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log("Starting cleanup of note_placeholder...");
  
  // Update all settings where note_placeholder contains typical examples
  const { data, error } = await supabase
    .from('settings')
    .update({ note_placeholder: '' })
    .or('note_placeholder.ilike.%cebola%,note_placeholder.ilike.%açai%,note_placeholder.ilike.%molho%');

  if (error) {
    console.error("Error during update:", error);
  } else {
    console.log("Update successful. Cleaned up placeholders with examples.");
  }
}

cleanup();
