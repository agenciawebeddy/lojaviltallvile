-- Adiciona o slug 'shop' na tabela page_headers para permitir gerenciamento do cabeçalho da página Shop
INSERT INTO public.page_headers (page_slug, title, description, image_url)
VALUES 
('shop', 'Nossa Loja', 'Explore nossa coleção completa de produtos selecionados.', 'https://picsum.photos/seed/shop/1920/300')
ON CONFLICT (page_slug) DO NOTHING;
