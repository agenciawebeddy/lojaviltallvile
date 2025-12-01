import { supabase } from '../integrations/supabase/client';

/**
 * Script temporário para adicionar o cabeçalho da página Shop
 * Execute este script uma vez através do console do navegador ou componente temporário
 */
export async function addShopHeaderToDatabase() {
    try {
        console.log('Adicionando cabeçalho da página Shop...');

        const { data, error } = await supabase
            .from('page_headers')
            .insert({
                page_slug: 'shop',
                title: 'Nossa Loja',
                description: 'Explore nossa coleção completa de produtos selecionados.',
                image_url: 'https://picsum.photos/seed/shop/1920/300'
            })
            .select();

        if (error) {
            // Se o erro for de conflito (registro já existe), não é um problema
            if (error.code === '23505') {
                console.log('✅ Cabeçalho da página Shop já existe no banco de dados!');
                return { success: true, message: 'Registro já existe' };
            }
            console.error('❌ Erro ao adicionar cabeçalho:', error);
            return { success: false, error };
        }

        console.log('✅ Cabeçalho da página Shop adicionado com sucesso!', data);
        return { success: true, data };
    } catch (err) {
        console.error('❌ Erro inesperado:', err);
        return { success: false, error: err };
    }
}

// Para executar via console do navegador:
// import { addShopHeaderToDatabase } from './utils/addShopHeader';
// addShopHeaderToDatabase();
