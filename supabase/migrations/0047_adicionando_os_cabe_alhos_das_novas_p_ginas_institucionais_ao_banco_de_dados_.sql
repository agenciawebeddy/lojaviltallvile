INSERT INTO public.page_headers (page_slug, title, description, image_url)
VALUES
    ('ajuda-e-suporte', 'Ajuda e Suporte', 'Encontre respostas para suas dúvidas mais frequentes.', 'https://picsum.photos/seed/ajuda/1920/300'),
    ('contato', 'Entre em Contato', 'Estamos aqui para ajudar. Fale conosco através dos nossos canais de atendimento.', 'https://picsum.photos/seed/contato/1920/300'),
    ('politica-de-trocas', 'Política de Trocas e Devoluções', 'Saiba como proceder para trocar ou devolver um produto.', 'https://picsum.photos/seed/trocas/1920/300'),
    ('politica-de-privacidade', 'Política de Privacidade', 'Entenda como cuidamos dos seus dados com segurança e transparência.', 'https://picsum.photos/seed/privacidade/1920/300'),
    ('termos-e-condicoes', 'Termos e Condições', 'Conheça as regras de uso da nossa loja online.', 'https://picsum.photos/seed/termos/1920/300')
ON CONFLICT (page_slug) DO NOTHING;