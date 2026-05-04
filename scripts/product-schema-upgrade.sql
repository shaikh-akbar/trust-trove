CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS slug text,
    ADD COLUMN IF NOT EXISTS brand text,
    ADD COLUMN IF NOT EXISTS short_description text,
    ADD COLUMN IF NOT EXISTS seo_title text,
    ADD COLUMN IF NOT EXISTS seo_description text,
    ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_cod_available boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS shipping_charge numeric(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cod_charge numeric(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS platform_fee numeric(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS convenience_fee numeric(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS supplier_name text,
    ADD COLUMN IF NOT EXISTS supplier_product_code text;

UPDATE public.products
SET
    slug = COALESCE(NULLIF(slug, ''), handle),
    short_description = COALESCE(NULLIF(short_description, ''), LEFT(regexp_replace(COALESCE(description, ''), '<[^>]*>', '', 'g'), 220)),
    updated_at = COALESCE(updated_at, created_at, timezone('utc'::text, now()))
WHERE
    slug IS NULL
    OR short_description IS NULL
    OR updated_at IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'products_slug_key'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.variants
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS cost_price numeric(10,2),
    ADD COLUMN IF NOT EXISTS profit_amount numeric(10,2),
    ADD COLUMN IF NOT EXISTS profit_percent numeric(6,2),
    ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS hsn_code text,
    ADD COLUMN IF NOT EXISTS gst_percent numeric(5,2);

UPDATE public.variants
SET
    is_default = CASE
        WHEN option1_value = 'Default Title' OR option1_value = 'Default' THEN true
        ELSE COALESCE(is_default, false)
    END,
    profit_amount = CASE
        WHEN cost_price IS NOT NULL THEN ROUND((COALESCE(price_selling, 0) - cost_price)::numeric, 2)
        ELSE profit_amount
    END,
    profit_percent = CASE
        WHEN cost_price IS NOT NULL AND cost_price > 0
            THEN ROUND((((COALESCE(price_selling, 0) - cost_price) / cost_price) * 100)::numeric, 2)
        ELSE profit_percent
    END,
    updated_at = COALESCE(updated_at, created_at, timezone('utc'::text, now()));

DROP TRIGGER IF EXISTS update_variants_updated_at ON public.variants;
CREATE TRIGGER update_variants_updated_at
    BEFORE UPDATE ON public.variants
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.product_images
    ADD COLUMN IF NOT EXISTS alt_text text,
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc'::text, now());

UPDATE public.product_images
SET created_at = COALESCE(created_at, timezone('utc'::text, now()))
WHERE created_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
