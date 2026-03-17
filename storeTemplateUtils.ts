import { supabase } from './supabaseClient';
import { 
    mockCategories, 
    mockGroups, 
    mockToppings, 
    mockSauces, 
    mockSizes, 
    mockProductsAcai, 
    mockProductsCombos 
} from './mockData';

/**
 * Aplica o template 'Açaiteria' a uma nova loja, copiando as categorias, 
 * grupos de opcionais, opções e produtos padrão.
 * 
 * @param storeId O UUID da loja recém-criada
 * @param storeName O nome da loja recém-criada
 */
export const applyAcaiteriaTemplate = async (storeId: string) => {
    console.log(`🚀 Aplicando Template Açaiteria na loja: ${storeId}`);
    
    // Mapeamento de IDs do mockData (string) para os UUIDs gerados pelo Supabase
    const idMap: Record<string, string> = {};

    try {
        // 1. Criar Categorias
        console.log('📂 Copiando categorias...');
        for (const cat of mockCategories) {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    store_id: storeId,
                    title: cat.title,
                    icon: cat.icon,
                    display_order: cat.displayOrder,
                    active: cat.active
                })
                .select('id')
                .single();

            if (error) throw new Error(`Erro Categoria (${cat.title}): ${error.message}`);
            if (data) idMap[cat.id] = data.id;
        }

        // 2. Criar Grupos (Acompanhamentos, Caldas, Tamanhos)
        console.log('🧩 Copiando grupos...');
        for (const group of mockGroups) {
            const { data, error } = await supabase
                .from('product_groups')
                .insert({
                    store_id: storeId,
                    title: group.title,
                    min: group.min,
                    max: group.max,
                    active: group.active
                })
                .select('id')
                .single();

            if (error) throw new Error(`Erro Grupo (${group.title}): ${error.message}`);
            if (data) {
                idMap[group.id] = data.id;

                // 2.1 Criar Opções para este Grupo
                let optionsToInsert = [];
                if (group.id === 'grp-acompanhamentos') optionsToInsert = mockToppings;
                else if (group.id === 'grp-caldas') optionsToInsert = mockSauces;
                else if (group.id === 'grp-tamanhos') optionsToInsert = mockSizes;

                for (const opt of optionsToInsert) {
                    const { data: optData, error: optError } = await supabase
                        .from('product_options')
                        .insert({
                            store_id: storeId,
                            group_id: data.id,
                            name: opt.name,
                            price: opt.price,
                            description: opt.description,
                            active: opt.active
                        })
                        .select('id')
                        .single();

                    if (optError) throw new Error(`Erro Opção (${opt.name}): ${optError.message}`);
                    if (optData) idMap[opt.id] = optData.id;
                }
            }
        }

        // 3. Criar Produtos
        console.log('🍦 Copiando produtos...');
        const allMockProducts = [...mockProductsAcai, ...mockProductsCombos];

        for (const prod of allMockProducts) {
            // Pegar o novo ID da categoria baseada no mapa
            const newCategoryId = idMap[prod.categoryId];
            if (!newCategoryId) continue; // Pula se a categoria falhou (não deve acontecer)

            const { data: currentProductData, error: prodError } = await supabase
                .from('products')
                .insert({
                    store_id: storeId,
                    category_id: newCategoryId,
                    name: prod.name,
                    description: prod.description,
                    price: prod.price,
                    image: prod.image,
                    display_order: prod.displayOrder,
                    active: prod.active
                })
                .select('id')
                .single();

            if (prodError) throw new Error(`Erro Produto (${prod.name}): ${prodError.message}`);
            
            // 3.1 Criar Relações Produto-Grupo
            if (currentProductData && prod.groupIds && prod.groupIds.length > 0) {
                for (const oldGroupId of prod.groupIds) {
                    const newGroupId = idMap[oldGroupId];
                    if (!newGroupId) continue;

                    await supabase
                        .from('product_group_relations')
                        .insert({
                            product_id: currentProductData.id,
                            group_id: newGroupId
                        });
                }
            }
        }

        console.log('✅ Template aplicacado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Falha ao aplicar template:', error);
        return false;
    }
};
