import { supabase } from '../supabaseClient';

/**
 * Clones all relevant data from a source store to a targeting (already created) store.
 * Uses the database RPC 'clone_store_complete' for maximum performance and atomicity.
 * 
 * @param sourceStoreId The UUID of the store to clone from
 * @param targetStoreId The UUID of the new store
 */
export const cloneStoreData = async (sourceStoreId: string, targetStoreId: string) => {
    console.log(`🚀 Iniciando clonagem via RPC: ${sourceStoreId} -> ${targetStoreId}`);
    
    try {
        // Chamada da função SQL que criamos no Supabase
        const { error } = await supabase.rpc('clone_store_complete', {
            source_id: sourceStoreId,
            target_id: targetStoreId
        });

        if (error) {
            console.error('❌ Erro na RPC de clonagem:', error);
            throw error;
        }

        console.log('✅ Clonagem via banco de dados concluída com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Falha ao clonar loja via RPC:', error);
        return false;
    }
};
