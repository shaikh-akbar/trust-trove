CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS public.user_addresses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone text NOT NULL,
    email text,
    address_line_1 text NOT NULL,
    address_line_2 text,
    landmark text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL DEFAULT 'India',
    address_type text NOT NULL DEFAULT 'home',
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    title text NOT NULL,
    description text,
    discount_type text NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value numeric(10,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount numeric(10,2) NOT NULL DEFAULT 0,
    max_discount_amount numeric(10,2),
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    usage_limit integer,
    used_count integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number text NOT NULL UNIQUE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    cart_id uuid REFERENCES public.carts(id) ON DELETE SET NULL,
    address_id uuid REFERENCES public.user_addresses(id) ON DELETE SET NULL,
    coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
    coupon_code text,
    status text NOT NULL DEFAULT 'payment_pending',
    payment_type text NOT NULL DEFAULT 'online' CHECK (payment_type IN ('online', 'cod')),
    payment_status text NOT NULL DEFAULT 'pending',
    fulfillment_status text NOT NULL DEFAULT 'unfulfilled',
    subtotal numeric(10,2) NOT NULL DEFAULT 0,
    discount_amount numeric(10,2) NOT NULL DEFAULT 0,
    base_shipping_amount numeric(10,2) NOT NULL DEFAULT 0,
    vendor_shipping_amount numeric(10,2) NOT NULL DEFAULT 0,
    shipping_amount numeric(10,2) NOT NULL DEFAULT 0,
    cod_charge_amount numeric(10,2) NOT NULL DEFAULT 0,
    platform_fee_amount numeric(10,2) NOT NULL DEFAULT 0,
    convenience_fee_amount numeric(10,2) NOT NULL DEFAULT 0,
    total_amount numeric(10,2) NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'INR',
    items_count integer NOT NULL DEFAULT 0,
    address_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
    razorpay_order_id text UNIQUE,
    razorpay_payment_id text,
    razorpay_signature text,
    razorpay_payment_status text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id uuid REFERENCES public.variants(id) ON DELETE SET NULL,
    title text NOT NULL,
    sku text,
    option_label text,
    image text,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price numeric(10,2) NOT NULL DEFAULT 0,
    compare_price numeric(10,2),
    line_total numeric(10,2) NOT NULL DEFAULT 0,
    product_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON public.user_addresses
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;
CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.user_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.user_addresses TO service_role;
GRANT ALL ON TABLE public.coupons TO service_role;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.order_items TO service_role;
