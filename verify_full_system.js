import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 INICIANDO DIAGNÓSTICO DO SISTEMA SUPABASE de:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey ? 'Definida (Oculta)' : 'AUSENTE ❌'}`);
console.log('--------------------------------------------------');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO CRÍTICO: Credenciais não encontradas no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
    let hasErrors = false;

    // 1. TESTE DE CONEXÃO E TABELAS
    console.log('\n1️⃣  TESTE DE CONEXÃO E TABELAS');
    const tablesToCheck = ['products', 'categories', 'orders', 'settings', 'product_groups', 'product_options'];

    for (const table of tablesToCheck) {
        process.stdout.write(`   Verificando tabela '${table}'... `);
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });

        if (error) {
            console.log('❌ FALHA');
            console.log(`      Erro: ${error.message}`);
            if (error.code === '42P01') {
                console.log('      ⚠️  DIAGNÓSTICO: A tabela não existe. O SQL de setup não foi rodado.');
                hasErrors = true;
            }
        } else {
            console.log('✅ OK');
        }
    }

    // 2. TESTE DE STORAGE
    console.log('\n2️⃣  TESTE DE STORAGE (IMAGENS)');
    const bucketName = 'product-images';
    process.stdout.write(`   Verificando bucket '${bucketName}'... `);

    // Tentar upload direto para validar existência + permissão de uma vez
    const fileName = `diag-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, 'Diagnostics Test');

    if (uploadError) {
        console.log('❌ FALHA');
        console.log(`      Erro: ${uploadError.message}`);
        if (uploadError.message.includes('bucket not found')) {
            console.log('      ⚠️  DIAGNÓSTICO: Bucket não existe.');
        } else if (uploadError.message.includes('new row violates row-level security')) {
            console.log('      ⚠️  DIAGNÓSTICO: Bucket existe, mas permissões (RLS) estão bloqueadas.');
        } else {
            console.log('      ⚠️  DIAGNÓSTICO: ' + uploadError.message);
        }
        hasErrors = true;
    } else {
        console.log('✅ OK (Upload e Permissões funcionando)');
        // Limpar
        await supabase.storage.from(bucketName).remove([fileName]);
    }

    // 3. TESTE DE ESCRITA NO BANCO (RLS)
    console.log('\n3️⃣  TESTE DE ESCRITA (PERMISSÕES/RLS)');
    process.stdout.write('   Tentando atualizar tabela settings... ');
    const { error: updateError } = await supabase
        .from('settings')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', 1);

    if (updateError) {
        console.log('❌ FALHA');
        console.log(`      Erro: ${updateError.message}`);
        hasErrors = true;
    } else {
        console.log('✅ OK');
    }

    console.log('\n--------------------------------------------------');
    if (hasErrors) {
        console.log('🚨 RESULTADO FINAL: PROBLEMAS ENCONTRADOS.');
        console.log('   Siga as instruções do assistente para corrigir.');
        console.log('   Provável causa: Script SQL mestre não foi rodado ou falhou.');
    } else {
        console.log('🎉 RESULTADO FINAL: TUDO PARECE ESTAR CORRETO.');
        console.log('   Se o problema persiste no Vercel, confirme as variáveis de ambiente LÁ.');
    }
}

runDiagnostics().catch(console.error);
