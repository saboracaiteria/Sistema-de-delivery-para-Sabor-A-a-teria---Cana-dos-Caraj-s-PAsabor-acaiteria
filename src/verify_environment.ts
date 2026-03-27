import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔍 Verificando configuração do ambiente...\n');

// Check if credentials exist
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Credenciais do Supabase não encontradas!');
    console.error('');
    console.error('📝 Ação necessária:');
    console.error('1. Copie o arquivo .env.example para .env.local');
    console.error('2. Edite .env.local e adicione suas credenciais do Supabase');
    console.error('3. Execute este script novamente');
    console.error('');
    console.error('💡 Onde encontrar as credenciais:');
    console.error('   https://supabase.com/dashboard → Settings → API');
    process.exit(1);
}

console.log('✅ Credenciais encontradas no .env.local\n');
console.log(`📍 URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...\n`);

// Try to connect to Supabase
console.log('🔌 Testando conexão com Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
    try {
        // Test connection by querying settings table
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Erro ao conectar com Supabase:', error.message);
            console.error('');
            console.error('🔧 Possíveis soluções:');
            console.error('1. Verifique se os scripts SQL foram executados no Supabase');
            console.error('2. Confirme que as credenciais estão corretas');
            console.error('3. Verifique a conexão com a internet');
            console.error('');
            console.error('📚 Consulte: SUPABASE_SETUP.md');
            process.exit(1);
        }

        console.log('✅ Conexão com Supabase estabelecida com sucesso!\n');

        // Check required tables
        console.log('📊 Verificando tabelas do banco de dados...\n');

        const tables = [
            'settings',
            'categories',
            'products',
            'product_groups',
            'product_options',
            'product_group_relations'
        ];

        let allTablesExist = true;

        for (const table of tables) {
            const { error } = await supabase.from(table).select('*').limit(1);

            if (error) {
                console.error(`❌ Tabela '${table}' não encontrada ou inacessível`);
                allTablesExist = false;
            } else {
                console.log(`✅ Tabela '${table}' OK`);
            }
        }

        console.log('');

        if (!allTablesExist) {
            console.error('⚠️  AVISO: Algumas tabelas não foram encontradas!');
            console.error('');
            console.error('📝 Execute os seguintes scripts SQL no Supabase (nesta ordem):');
            console.error('   1. supabase-schema.sql');
            console.error('   2. supabase-storage.sql');
            console.error('   3. add_active_column.sql');
            console.error('   4. add_theme_colors.sql');
            console.error('');
            console.error('🌐 Supabase SQL Editor:');
            console.error(`   ${supabaseUrl}/project/_/sql`);
            process.exit(1);
        }

        console.log('🎉 Todas as tabelas necessárias estão presentes!\n');
        console.log('✅ Ambiente configurado corretamente!');
        console.log('');
        console.log('🚀 Próximo passo: Execute a importação de dados');
        console.log('   npx tsx import_user_data.ts');
        console.log('');

    } catch (err) {
        console.error('❌ Erro inesperado:', err);
        process.exit(1);
    }
}

verifyConnection();
