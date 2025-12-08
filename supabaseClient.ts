import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente - configurar no .env.local
// Tentar pegar do localStorage (para SETUP via UI) ou do ambiente
const localUrl = localStorage.getItem('OBBA_SUPABASE_URL');
const localKey = localStorage.getItem('OBBA_SUPABASE_ANON_KEY');

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = localUrl || envUrl || '';
const supabaseAnonKey = localKey || envKey || '';

// Verificar se as credenciais são válidas (não apenas placeholders)
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('YOUR_');
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20 && !supabaseAnonKey.includes('YOUR_');

export const isConfigured = !!(isValidUrl && isValidKey);

// Evitar crash se estiver vazio (retorna cliente dummy ou validado)
// Se não tiver url válida, criamos um cliente dummy que nunca será usado
export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    })
    : createClient('https://dummy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.L5sNt7KYQ-dummy', {
        auth: { persistSession: false },
        global: { headers: {} }
    }); // Dummy client para não quebrar imports


// Helper para debug
export const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('settings').select('*').limit(1);
        if (error) {
            console.error('❌ Erro ao conectar com Supabase:', error.message);
            return false;
        }
        console.log('✅ Conexão com Supabase estabelecida!');
        return true;
    } catch (err) {
        console.error('❌ Erro ao testar conexão:', err);
        return false;
    }
};
