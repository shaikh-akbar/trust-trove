ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS payment_type text NOT NULL DEFAULT 'online';

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS base_shipping_amount numeric(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS vendor_shipping_amount numeric(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cod_charge_amount numeric(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS platform_fee_amount numeric(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS convenience_fee_amount numeric(10,2) NOT NULL DEFAULT 0;

ALTER TABLE public.orders
    DROP CONSTRAINT IF EXISTS orders_payment_type_check;

ALTER TABLE public.orders
    ADD CONSTRAINT orders_payment_type_check
    CHECK (payment_type IN ('online', 'cod'));
