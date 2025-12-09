import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorage() {
    console.log('\n🔍 Verificando Permissões de Upload...');
    const bucketName = 'product-images';

    // Pular listagem e tentar upload direto
    console.log(`📤 Tentando enviar arquivo para '${bucketName}'...`);
    const fileName = `verification-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, 'Teste de permissões de escrita');

    if (uploadError) {
        console.error('❌ Falha no upload:', uploadError.message);
        console.error('⚠️ Motivo provável: Políticas RLS (Row Level Security) bloqueando acesso.');
    } else {
        console.log('✅ Upload realizado com sucesso!');
        console.log('   Caminho:', uploadData.path);

        const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uploadData.path);

        console.log('🔗 URL Pública:', urlData.publicUrl);
        console.log('ℹ️ Se conseguir abrir o link acima, a configuração está 100%.');

        // Limpeza
        await supabase.storage.from(bucketName).remove([fileName]);
    }
}

verifyStorage().catch(console.error);
