CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_items_user_product
ON public.wishlist_items(user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

DROP TRIGGER IF EXISTS update_wishlist_items_updated_at ON public.wishlist_items;
CREATE TRIGGER update_wishlist_items_updated_at
    BEFORE UPDATE ON public.wishlist_items
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.wishlist_items DISABLE ROW LEVEL SECURITY;

DROP VIEW IF EXISTS public.product_rating_summary;
DROP TABLE IF EXISTS public.product_ratings;

CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    display_name text NOT NULL,
    city text,
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    headline text,
    review_text text NOT NULL,
    is_approved boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_approved_created
ON public.customer_reviews(is_approved, created_at DESC);

DROP TRIGGER IF EXISTS update_customer_reviews_updated_at ON public.customer_reviews;
CREATE TRIGGER update_customer_reviews_updated_at
    BEFORE UPDATE ON public.customer_reviews
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.customer_reviews DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    display_name text NOT NULL,
    city text,
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    headline text,
    review_text text NOT NULL,
    is_approved boolean NOT NULL DEFAULT true,
    is_sample boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_approved_created
ON public.product_reviews(product_id, is_approved, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_reviews_user_product
ON public.product_reviews(user_id, product_id)
WHERE user_id IS NOT NULL;

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON public.product_reviews
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.product_reviews DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.wishlist_items TO service_role;
GRANT ALL ON TABLE public.customer_reviews TO service_role;
GRANT ALL ON TABLE public.product_reviews TO service_role;
