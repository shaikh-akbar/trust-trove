INSERT INTO public.coupons (
    code,
    title,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    is_active
)
VALUES
    (
        'GOMO20',
        'Flat Rs. 20 Off',
        'Get a flat Rs. 20 discount on your order.',
        'fixed',
        20,
        0,
        true
    ),
    (
        'GOMO10',
        'Flat Rs. 10 Off',
        'Get a flat Rs. 10 discount on your order.',
        'fixed',
        10,
        0,
        true
    )
ON CONFLICT (code) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    min_order_amount = EXCLUDED.min_order_amount,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());
