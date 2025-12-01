INSERT INTO public.page_headers (page_slug, title, description, image_url)
VALUES
    ('cart', 'Seu Carrinho de Compras', 'Revise seus itens e prossiga para o checkout.', 'https://picsum.photos/seed/cart/1920/300'),
    ('checkout', 'Finalizar Compra', 'Preencha seus dados, escolha o frete e finalize o pagamento.', 'https://picsum.photos/seed/checkout/1920/300'),
    ('product-detail', 'Detalhes do Produto', 'Informações completas sobre o produto selecionado.', 'https://picsum.photos/seed/productdetail/1920/300')
ON CONFLICT (page_slug) DO NOTHING;