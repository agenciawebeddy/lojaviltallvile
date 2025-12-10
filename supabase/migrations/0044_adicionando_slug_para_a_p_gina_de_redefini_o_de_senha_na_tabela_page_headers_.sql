INSERT INTO public.page_headers (page_slug, title, description, image_url)
VALUES
    ('reset-password', 'Redefinir Senha', 'Crie uma nova senha segura para sua conta.', 'https://picsum.photos/seed/resetpassword/1920/300')
ON CONFLICT (page_slug) DO NOTHING;