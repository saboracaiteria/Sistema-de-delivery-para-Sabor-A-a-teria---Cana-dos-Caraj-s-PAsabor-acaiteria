// Mock data para desenvolvimento local - Sabor Açaíteria

// Gerar IDs consistentes
const CAT_ACAI_ID = 'cat-acai-tradicional';
const CAT_COMBOS_ID = 'cat-combos-especiais';

const GRP_TOPPINGS_ID = 'grp-acompanhamentos';
const GRP_SAUCES_ID = 'grp-caldas';
const GRP_SIZE_ID = 'grp-tamanhos';

export const mockCategories = [
    { id: CAT_ACAI_ID, title: 'Açaí Tradicional', icon: '💜', displayOrder: 1, active: true },
    { id: CAT_COMBOS_ID, title: 'Combos Especiais', icon: '✨', displayOrder: 2, active: true }
];

export const mockGroups = [
    {
        id: GRP_TOPPINGS_ID,
        title: 'Acompanhamentos (Escolha até 3)',
        min: 0,
        max: 3,
        active: true,
        options: []
    },
    {
        id: GRP_SAUCES_ID,
        title: 'Caldas (Escolha até 1)',
        min: 0,
        max: 1,
        active: true,
        options: []
    },
    {
        id: GRP_SIZE_ID,
        title: 'Tamanho',
        min: 1,
        max: 1,
        active: true,
        options: []
    }
];

// Acompanhamentos (25 itens)
export const mockToppings = [
    'Amendoim', 'Aveia', 'Banana', 'Coco Ralado', 'Creme de Avelã',
    'Creme de Cupuaçu', 'Creme de Leite Ninho', 'Flocos', 'Granola Tradicional',
    'Kiwi', 'Leite em Pó', 'Manga', 'Morango', 'Mousse de Maracujá',
    'Paçoca', 'Sorvete', 'Tapioca', 'Uva',
    'Bis Picado', 'Chocopower', 'Confetes', 'Gotas de Chocolate',
    'M&M\'s', 'Ovomaltine', 'Sonho de Valsa'
].map((name, idx) => ({
    id: `opt-topping-${idx}`,
    name,
    price: 0,
    description: '',
    active: true
}));

// Caldas (6 itens)
export const mockSauces = [
    'Calda de Açaí', 'Calda de Caramelo', 'Calda de Chocolate',
    'Calda de Kiwi', 'Calda de Morango', 'Leite Condensado'
].map((name, idx) => ({
    id: `opt-sauce-${idx}`,
    name,
    price: 0,
    description: '',
    active: true
}));

// Tamanhos (3 opções para combos)
export const mockSizes = [
    { name: '300ml', price: 0 },
    { name: '400ml', price: 3.00 },
    { name: '500ml', price: 6.00 }
].map((opt, idx) => ({
    id: `opt-size-${idx}`,
    name: opt.name,
    price: opt.price,
    description: '',
    active: true
}));

// Atualizar grupos com opções
mockGroups[0].options = mockToppings;
mockGroups[1].options = mockSauces;
mockGroups[2].options = mockSizes;

// Produtos Açaí Tradicional (3 produtos)
export const mockProductsAcai = [
    {
        id: 'prod-300ml',
        categoryId: CAT_ACAI_ID,
        name: 'Copo 300ml',
        price: 14.00,
        description: 'Monte seu açaí com seus acompanhamentos preferidos.',
        image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
        groupIds: [GRP_TOPPINGS_ID, GRP_SAUCES_ID],
        displayOrder: 1,
        active: true
    },
    {
        id: 'prod-400ml',
        categoryId: CAT_ACAI_ID,
        name: 'Copo 400ml',
        price: 17.00,
        description: 'Monte seu açaí com seus acompanhamentos preferidos.',
        image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
        groupIds: [GRP_TOPPINGS_ID, GRP_SAUCES_ID],
        displayOrder: 2,
        active: true
    },
    {
        id: 'prod-500ml',
        categoryId: CAT_ACAI_ID,
        name: 'Copo 500ml',
        price: 20.00,
        description: 'Monte seu açaí com seus acompanhamentos preferidos.',
        image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
        groupIds: [GRP_TOPPINGS_ID, GRP_SAUCES_ID],
        displayOrder: 3,
        active: true
    }
];

// Combos Especiais (16 produtos)
const combosData = [
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
    { name: 'Ninho (A)', description: 'Sugestão: leite em pó, morango, banana, leite condensado' },
    { name: 'Bombom', description: 'Sugestão: Sonho de Valsa, leite em pó, calda de chocolate, creme de avelã' },
    { name: 'Maracujá', description: 'Sugestão: mousse de maracujá, creme de avelã, leite em pó, calda de chocolate' },
];

export const mockProductsCombos = combosData.map((combo, idx) => ({
    id: `prod-combo-${idx}`,
    categoryId: CAT_COMBOS_ID,
    name: combo.name,
    price: 14.00,
    description: combo.description,
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400',
    groupIds: [GRP_SIZE_ID],
    displayOrder: idx + 1,
    active: true
}));

export const mockProducts = [...mockProductsAcai, ...mockProductsCombos];

export const mockSettings = {
    storeName: 'Sabor Açaíteria',
    logoUrl: 'https://raw.githubusercontent.com/saboracaiteria/SABOR-/main/175.jpg',
    logoShape: 'circle' as const,
    bannerUrl: 'https://raw.githubusercontent.com/saboracaiteria/SABOR-/main/175.jpg',
    whatsappNumber: '5594991623576',
    storeStatus: 'auto' as const,
    deliveryFee: 7.00,
    openingHours: [
        { dayOfWeek: 0, open: '15:30', close: '21:45', enabled: true }, // Domingo
        { dayOfWeek: 1, open: '19:15', close: '22:00', enabled: true }, // Segunda
        { dayOfWeek: 2, open: '19:15', close: '22:00', enabled: true }, // Terça
        { dayOfWeek: 3, open: '19:15', close: '22:00', enabled: true }, // Quarta
        { dayOfWeek: 4, open: '19:15', close: '22:00', enabled: true }, // Quinta
        { dayOfWeek: 5, open: '19:15', close: '22:00', enabled: true }, // Sexta
        { dayOfWeek: 6, open: '15:30', close: '21:45', enabled: true }  // Sábado
    ],
    deliveryOnly: false,
    instagramUrl: 'https://www.instagram.com/sabor_acaiteria/',
    businessAddress: 'Canaã dos Carajás-PA 2025-2026'
};

export const mockCoupons = [
    { id: 'coupon-1', code: 'TAXAZERO', type: 'fixed' as const, value: 7.00, active: true, usageCount: 0 },
    { id: 'coupon-2', code: 'SABOR10', type: 'percent' as const, value: 10, active: true, usageCount: 0 },
    { id: 'coupon-3', code: 'SABOR15', type: 'percent' as const, value: 15, active: true, usageCount: 0 },
    { id: 'coupon-4', code: 'SABOR25', type: 'percent' as const, value: 25, active: true, usageCount: 0 }
];

console.log('📦 Mock Data Carregado:');
console.log(`  ✅ ${mockCategories.length} categorias`);
console.log(`  ✅ ${mockProducts.length} produtos (${mockProductsAcai.length} tradicionais + ${mockProductsCombos.length} combos)`);
console.log(`  ✅ ${mockGroups.length} grupos de opções`);
console.log(`  ✅ ${mockToppings.length} acompanhamentos`);
console.log(`  ✅ ${mockSauces.length} caldas`);
console.log(`  ✅ ${mockSizes.length} tamanhos`);
console.log(`  ✅ ${mockCoupons.length} cupons`);