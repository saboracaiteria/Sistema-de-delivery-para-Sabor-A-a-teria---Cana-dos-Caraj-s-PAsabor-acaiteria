import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log('📄 Lendo .env.local...');
    const envConfig = dotenv.config({ path: envPath });
    if (envConfig.error) {
        console.error('❌ Erro ao ler .env.local:', envConfig.error);
    }
} else {
    console.error('❌ Arquivo .env.local não encontrado!');
    process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais do Supabase não encontradas no .env.local');
    console.log('URL:', supabaseUrl ? 'Definida' : 'Ausente');
    console.log('KEY:', supabaseKey ? 'Definida' : 'Ausente');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorage() {
    console.log('\n🔍 Verificando Storage do Supabase...');
    console.log(`📡 URL: ${supabaseUrl}`);

    // 1. Listar Buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('❌ Erro ao listar buckets:', listError.message);
        return;
    }

    console.log('✅ Buckets encontrados:', buckets.length);
    buckets.forEach(b => console.log(`   - ${b.name} (public: ${b.public})`));

    const bucketName = 'product-images';
    const bucket = buckets.find(b => b.name === bucketName);

    if (!bucket) {
        console.error(`❌ Bucket '${bucketName}' NÃO encontrado!`);
        console.log('   Execute o script supabase-storage.sql no SQL Editor do Supabase.');
        return;
    }

    console.log(`✅ Bucket '${bucketName}' encontrado!`);

    // 2. Testar Upload
    console.log('\n📤 Testando upload de arquivo dummy...');
    const fileName = `test-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, 'Teste de upload via script de verificação');

    if (uploadError) {
        console.error('❌ Falha no upload:', uploadError.message);
        console.error('   Verifique as Políticas de Segurança (RLS) do Storage.');
    } else {
        console.log('✅ Upload realizado com sucesso:', uploadData.path);

        // 3. Testar URL Pública
        const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uploadData.path);

        console.log('🔗 URL Pública:', urlData.publicUrl);

        // 4. Limpar arquivo de teste
        const { error: deleteError } = await supabase.storage
            .from(bucketName)
            .remove([fileName]);

        if (deleteError) {
            console.warn('⚠️ Erro ao deletar arquivo de teste:', deleteError.message);
        } else {
            console.log('🗑️ Arquivo de teste removido.');
        }
    }
}

verifyStorage().catch(err => console.error('Erro inesperado:', err));
