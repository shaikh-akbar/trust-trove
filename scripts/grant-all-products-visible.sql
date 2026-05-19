-- Makes all catalog products visible in the storefront.
-- The app only shows products when:
-- 1. products.status = 'active'
-- 2. variants.status = 'active'
-- 3. variants.inventory_quantity > 0

BEGIN;

UPDATE public.products
SET
  status = 'active',
  updated_at = timezone('utc'::text, now())
WHERE COALESCE(status, '') <> 'active';

UPDATE public.variants
SET
  status = 'active',
  inventory_quantity = CASE
    WHEN COALESCE(inventory_quantity, 0) <= 0 THEN 100
    ELSE inventory_quantity
  END,
  updated_at = timezone('utc'::text, now())
WHERE
  COALESCE(status, '') <> 'active'
  OR COALESCE(inventory_quantity, 0) <= 0;

COMMIT;

-- Optional verification:
-- SELECT COUNT(*) AS total_products FROM public.products;
-- SELECT COUNT(*) AS active_products FROM public.products WHERE status = 'active';
-- SELECT COUNT(DISTINCT p.id) AS visible_products
-- FROM public.products p
-- JOIN public.variants v ON v.product_id = p.id
-- WHERE p.status = 'active'
--   AND v.status = 'active'
--   AND COALESCE(v.inventory_quantity, 0) > 0;

-- Optional cache reset after running the updates:
-- DELETE FROM public.catalog_cache
-- WHERE key LIKE 'trusttrove:catalog:%';
