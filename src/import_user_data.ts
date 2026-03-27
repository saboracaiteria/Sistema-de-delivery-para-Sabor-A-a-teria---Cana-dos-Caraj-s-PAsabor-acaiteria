import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
    console.error('');
    console.error('💡 Run the verification script first:');
    console.error('   npx tsx verify_environment.ts');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);


// --- DATA FROM HTML ---

const OPENING_HOURS = [
    { open: '15:30', close: '21:45' }, // Domingo (0)
    { open: '19:15', close: '22:00' }, // Segunda (1)
    { open: '19:15', close: '22:00' }, // Terça (2)
    { open: '19:15', close: '22:00' }, // Quarta (3)
    { open: '19:15', close: '22:00' }, // Quinta (4)
    { open: '19:15', close: '22:00' }, // Sexta (5)
    { open: '15:30', close: '21:45' }  // Sábado (6)
];

const SETTINGS = {
    store_name: 'Sabor Açaíteria',
    whatsapp_number: '5594991623576',
    opening_hours: OPENING_HOURS,
    address: 'Av. rio Branco. novo Horizonte.. antigo Obba açaí',
    delivery_fee: 7.00, // From "Outro Bairro" default
    logo_url: 'https://raw.githubusercontent.com/saboracaiteria/SABOR-/main/175.jpg',
    banner_url: 'https://raw.githubusercontent.com/saboracaiteria/SABOR-/main/175.jpg' // Using same for now as cover
};

// UUIDs for Categories
const CAT_ACAI_ID = uuidv4();
const CAT_COMBOS_ID = uuidv4();

const CATEGORIES = [
    { id: CAT_ACAI_ID, title: 'Açaí Tradicional', icon: '💜', display_order: 1 },
    { id: CAT_COMBOS_ID, title: 'Combos Especiais', icon: '✨', display_order: 2 }
];

// Start UUIDs for Groups
const GRP_TOPPINGS_ID = uuidv4();
const GRP_SAUCES_ID = uuidv4();
const GRP_SIZE_ID = uuidv4(); // For Combos

const GROUPS = [
    {
        id: GRP_TOPPINGS_ID,
        title: 'Acompanhamentos (Escolha até 3)',
        min: 0,
        max: 3
    },
    {
        id: GRP_SAUCES_ID,
        title: 'Caldas (Escolha até 1)',
        min: 0,
        max: 1
    },
    {
        id: GRP_SIZE_ID,
        title: 'Tamanho',
        min: 1,
        max: 1
    }
];

const OPTIONS_TOPPINGS = [
    'Amendoim', 'Aveia', 'Banana', 'Coco Ralado', 'Creme de Avelã',
    'Creme de Cupuaçu', 'Creme de Leite Ninho', 'Flocos', 'Granola Tradicional',
    'Kiwi', 'Leite em Pó', 'Manga', 'Morango', 'Mousse de Maracujá',
    'Paçoca', 'Sorvete', 'Tapioca', 'Uva',
    'Bis Picado', 'Chocopower', 'Confetes', 'Gotas de Chocolate',
    'M&M\'s', 'Ovomaltine', 'Sonho de Valsa'
].map(name => ({
    id: uuidv4(),
    group_id: GRP_TOPPINGS_ID,
    name,
    price: 0,
    description: ''
}));

const OPTIONS_SAUCES = [
    'Calda de Açaí', 'Calda de Caramelo', 'Calda de Chocolate',
    'Calda de Kiwi', 'Calda de Morango', 'Leite Condensado'
].map(name => ({
    id: uuidv4(),
    group_id: GRP_SAUCES_ID,
    name,
    price: 0,
    description: ''
}));

// Combo sizes with price increments relative to base 14.00
const OPTIONS_SIZES = [
    { name: '300ml', price: 0 },    // 14.00
    { name: '400ml', price: 3.00 }, // 17.00
    { name: '500ml', price: 6.00 }  // 20.00
].map(opt => ({
    id: uuidv4(),
    group_id: GRP_SIZE_ID,
    name: opt.name,
    price: opt.price,
    description: ''
}));

const ALL_OPTIONS = [...OPTIONS_TOPPINGS, ...OPTIONS_SAUCES, ...OPTIONS_SIZES];

// Products
// Base Açaí (Fixed sizes) -> "Traditional" category
// Using IDs from HTML (1, 2, 3) mapped to UUIDs
const PROD_300_ID = uuidv4();
const PROD_400_ID = uuidv4();
const PROD_500_ID = uuidv4();

const PRODUCTS_ACAI = [
    { id: PROD_300_ID, category_id: CAT_ACAI_ID, name: 'Copo 300ml', price: 14.00, description: 'Monte seu açaí com seus acompanhamentos preferidos.' },
    { id: PROD_400_ID, category_id: CAT_ACAI_ID, name: 'Copo 400ml', price: 17.00, description: 'Monte seu açaí com seus acompanhamentos preferidos.' },
    { id: PROD_500_ID, category_id: CAT_ACAI_ID, name: 'Copo 500ml', price: 20.00, description: 'Monte seu açaí com seus acompanhamentos preferidos.' }
];

const COMBOS_DATA = [
    { name: 'Diet Granola', description: 'Sugestão: granola, leite em pó, leite condensado' },
    { name: 'Refrescante', description: 'Sugestão: sorvete, calda de chocolate, leite em pó, leite condensado' },
    { name: 'Mega Especial', description: 'Sugestão: leite em pó, leite condensado, banana, creme de avelã (Nutella)' },
    { name: 'Preferido', description: 'Sugestão: paçoca, leite em pó, leite condensado, creme de avelã (Nutella)' },
    { name: 'Maltine +', description: 'Sugestão: ovomaltine, tapioca, leite em pó, leite condensado' },
    { name: 'Amendoimix', description: 'Sugestão: amendoim, leite em pó, leite condensado' },
    { name: 'Megapower', description: 'Sugestão: chocopower, leite em pó, leite condensado, creme de avelã (Nutella)' },
    { name: 'Açaí Banana', description: 'Sugestão: leite em pó, tapioca, leite condensado, banana' },
    { name: 'Favorito Nutella', description: 'Sugestão: flocos, leite condensado, leite em pó, creme de avelã (Nutella)' },
    { name: 'Sabores do Pará', description: 'Sugestão: banana, uva, leite em pó, leite condensado, creme de avelã (Nutella)' },
    { name: 'Kids Especial', description: 'Sugestão: M&M\'s, uva, creme de avelã (Nutella), leite em pó, leite condensado, banana' },
    { name: 'Namorados', description: 'Sugestão: uva, morango, creme de avelã (Nutella), leite em pó, leite condensado' },
    { name: 'Euforia', description: 'Sugestão: morango, kiwi, banana, leite em pó, calda de morango' },
    { name: 'Ninho (A)', description: 'Sugestão: leite em po, morango, banana, leite condensado' },
    { name: 'Bombom', description: 'Sugestão: Sonho de Valsa, leite em pó, calda de chocolate, creme de avelã' },
    { name: 'Maracujá', description: 'Sugestão: mousse de maracujá, creme de avelã, leite em pó, calda de chocolate' },
];

const PRODUCTS_COMBOS = COMBOS_DATA.map(c => ({
    id: uuidv4(),
    category_id: CAT_COMBOS_ID,
    name: c.name,
    price: 14.00, // Base price for 300ml
    description: c.description
}));

const ALL_PRODUCTS = [...PRODUCTS_ACAI, ...PRODUCTS_COMBOS];


async function importData() {
    try {
        // 1. Update Settings
        console.log('⚙️ Updating Settings...');
        const { error: settingsError } = await supabase
            .from('settings')
            .update(SETTINGS)
            .eq('id', 1); // Assuming ID 1 exists

        // If update fails (maybe no ID 1), try insert
        if (settingsError) {
            // Just upsert ID 1
            await supabase.from('settings').upsert({ id: 1, ...SETTINGS });
        }
        console.log('✅ Settings updated.');

        // 2. Insert Categories
        console.log('📂 Inserting Categories...');
        const { error: catError } = await supabase
            .from('categories')
            .upsert(CATEGORIES);
        if (catError) throw catError;
        console.log(`✅ ${CATEGORIES.length} Categories inserted.`);

        // 3. Insert Groups
        console.log('🧩 Inserting Groups...');
        const { error: grpError } = await supabase
            .from('product_groups')
            .upsert(GROUPS);
        if (grpError) throw grpError;
        console.log(`✅ ${GROUPS.length} Groups inserted.`);

        // 4. Insert Options
        console.log('🍬 Inserting Options...');
        const { error: optError } = await supabase
            .from('product_options')
            .upsert(ALL_OPTIONS);
        if (optError) throw optError;
        console.log(`✅ ${ALL_OPTIONS.length} Options inserted.`);

        // 5. Insert Products
        console.log('🍦 Inserting Products...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(ALL_PRODUCTS);
        if (prodError) throw prodError;
        console.log(`✅ ${ALL_PRODUCTS.length} Products inserted.`);

        // 6. Link Products to Groups
        console.log('🔗 Linking Products to Groups...');
        const RELATIONS = [];

        // Link "Base Açaí" to Toppings & Sauces
        PRODUCTS_ACAI.forEach(p => {
            RELATIONS.push({ product_id: p.id, group_id: GRP_TOPPINGS_ID });
            RELATIONS.push({ product_id: p.id, group_id: GRP_SAUCES_ID });
        });

        // Link "Combos" to Size
        PRODUCTS_COMBOS.forEach(p => {
            RELATIONS.push({ product_id: p.id, group_id: GRP_SIZE_ID });
        });

        const { error: relError } = await supabase
            .from('product_group_relations')
            .upsert(RELATIONS);
        if (relError) throw relError;
        console.log(`✅ ${RELATIONS.length} Relations created.`);

        console.log('\n🎉 IMPORT COMPLETED SIGNIFICANTLY SUCCESSFUL!');

    } catch (err) {
        console.error('❌ Error importing data:', err);
    }
}

importData();
