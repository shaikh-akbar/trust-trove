CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS public.wukusy_products (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    wukusy_product_id text,
    sku text NOT NULL,
    title text NOT NULL,
    cost_price numeric(10,2) NOT NULL DEFAULT 0,
    gst_percent numeric(5,2) NOT NULL DEFAULT 18,
    weight_grams integer NOT NULL DEFAULT 0,
    stock_qty integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'active',
    raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    last_synced_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_supplier_map (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id uuid NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
    supplier text NOT NULL DEFAULT 'wukusy',
    source_product_id text,
    source_sku text NOT NULL,
    match_status text NOT NULL DEFAULT 'matched',
    notes text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.variant_supplier_sync (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    variant_id uuid NOT NULL UNIQUE REFERENCES public.variants(id) ON DELETE CASCADE,
    supplier text NOT NULL DEFAULT 'wukusy',
    supplier_sku text NOT NULL,
    supplier_product_id text,
    supplier_cost_price numeric(10,2) NOT NULL DEFAULT 0,
    supplier_gst_percent numeric(5,2) NOT NULL DEFAULT 18,
    supplier_weight_grams integer NOT NULL DEFAULT 0,
    supplier_stock_qty integer NOT NULL DEFAULT 0,
    estimated_shipping_share numeric(10,2) NOT NULL DEFAULT 0,
    shipping_tax_amount numeric(10,2) NOT NULL DEFAULT 0,
    margin_amount numeric(10,2) NOT NULL DEFAULT 50,
    display_price_final numeric(10,2) NOT NULL DEFAULT 0,
    raw_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
    last_synced_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.variants
    ADD COLUMN IF NOT EXISTS supplier_name text,
    ADD COLUMN IF NOT EXISTS supplier_sku text,
    ADD COLUMN IF NOT EXISTS supplier_product_id text,
    ADD COLUMN IF NOT EXISTS supplier_cost_price numeric(10,2),
    ADD COLUMN IF NOT EXISTS supplier_gst_percent numeric(5,2),
    ADD COLUMN IF NOT EXISTS supplier_weight_grams integer,
    ADD COLUMN IF NOT EXISTS estimated_shipping_share numeric(10,2),
    ADD COLUMN IF NOT EXISTS shipping_tax_amount numeric(10,2),
    ADD COLUMN IF NOT EXISTS margin_amount numeric(10,2) DEFAULT 50,
    ADD COLUMN IF NOT EXISTS display_price_final numeric(10,2),
    ADD COLUMN IF NOT EXISTS last_supplier_sync_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wukusy_products_sku
ON public.wukusy_products(sku);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_supplier_map_variant_supplier
ON public.product_supplier_map(variant_id, supplier);

CREATE INDEX IF NOT EXISTS idx_product_supplier_map_source_sku
ON public.product_supplier_map(source_sku);

CREATE INDEX IF NOT EXISTS idx_variant_supplier_sync_supplier_sku
ON public.variant_supplier_sync(supplier_sku);

CREATE INDEX IF NOT EXISTS idx_variants_supplier_sku
ON public.variants(supplier_sku);

DROP TRIGGER IF EXISTS update_wukusy_products_updated_at ON public.wukusy_products;
CREATE TRIGGER update_wukusy_products_updated_at
    BEFORE UPDATE ON public.wukusy_products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_supplier_map_updated_at ON public.product_supplier_map;
CREATE TRIGGER update_product_supplier_map_updated_at
    BEFORE UPDATE ON public.product_supplier_map
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_variant_supplier_sync_updated_at ON public.variant_supplier_sync;
CREATE TRIGGER update_variant_supplier_sync_updated_at
    BEFORE UPDATE ON public.variant_supplier_sync
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.wukusy_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_supplier_map DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_supplier_sync DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.wukusy_products TO service_role;
GRANT ALL ON TABLE public.product_supplier_map TO service_role;
GRANT ALL ON TABLE public.variant_supplier_sync TO service_role;
