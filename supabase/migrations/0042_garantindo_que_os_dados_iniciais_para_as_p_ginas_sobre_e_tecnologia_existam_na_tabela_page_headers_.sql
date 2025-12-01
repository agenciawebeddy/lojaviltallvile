INSERT INTO public.page_headers (page_slug, title, description, image_url)
VALUES
    ('sobre', 'Sobre a LojaEddy', 'Conectando você aos melhores produtos com paixão e tecnologia.', 'https://picsum.photos/seed/about/1920/300'),
    ('tecnologia', 'Tecnologia e Recursos da Loja', 'Conheça a arquitetura moderna e as funcionalidades que tornam a VitalVillé rápida e segura.', 'https://picsum.photos/seed/tech/1920/300')
ON CONFLICT (page_slug) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;