BEGIN;

-- GoModexa derives category pages from product.category/product_type,
-- so setting both to 'Ladies Bag' is enough to create the category grouping.

DROP TABLE IF EXISTS tmp_ladies_bag_seed;

CREATE TEMP TABLE tmp_ladies_bag_seed (
  handle text PRIMARY KEY,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  short_description text NOT NULL,
  vendor text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  product_type text NOT NULL,
  tags text[] NOT NULL,
  main_image text NOT NULL,
  status text NOT NULL,
  supplier_name text NOT NULL,
  supplier_product_code text NOT NULL,
  seo_title text NOT NULL,
  seo_description text NOT NULL,
  sku text NOT NULL,
  price_selling numeric NOT NULL,
  price_compare numeric,
  inventory_quantity integer NOT NULL,
  alt_text text NOT NULL,
  images text[] NOT NULL
);

INSERT INTO tmp_ladies_bag_seed (
  handle,
  slug,
  title,
  description,
  short_description,
  vendor,
  brand,
  category,
  product_type,
  tags,
  main_image,
  status,
  supplier_name,
  supplier_product_code,
  seo_title,
  seo_description,
  sku,
  price_selling,
  price_compare,
  inventory_quantity,
  alt_text,
  images
)
VALUES
(
  'salvage-sage-luxury-canvas-leather-satchel-bag-women',
  'salvage-sage-luxury-canvas-leather-satchel-bag-women',
  'Salvage Sage Luxury Canvas & Leather Satchel Bag with Gold Chain Strap | Women''s Premium Crossbody Handbag',
  $$<p>Introducing the Salvage Sage Satchel, where timeless craftsmanship meets contemporary sophistication. This exquisitely designed handbag is a celebration of refined elegance, crafted for the woman who commands attention without saying a word.</p>
<p><strong>Crafted for the discerning woman:</strong> The Salvage Sage features a luxurious sage green washed canvas body paired with rich dark chocolate genuine leather trims, creating a striking two-tone contrast that moves effortlessly from boardroom to brunch. Every detail has been thoughtfully curated, from the ornate dotted stitch border detailing to the polished gold-tone magnetic snap closures and gold chain shoulder strap.</p>
<h3>Premium Materials &amp; Construction</h3>
<ul>
<li>Exterior: High-grade washed canvas with leather overlay panels</li>
<li>Trims &amp; straps: Genuine dark brown leather</li>
<li>Hardware: Gold-tone metal fittings, magnetic snap buttons, and padlock accent</li>
<li>Strap options: Detachable gold chain crossbody strap plus structured top handle</li>
<li>Lining: Premium satin or suede-style soft-touch interior lining</li>
<li>Closure: Dual gold magnetic snap buttons</li>
</ul>
<h3>Design Highlights</h3>
<ul>
<li>Structured satchel silhouette for a polished look</li>
<li>Handcrafted dotted embroidery border for an artisan finish</li>
<li>Dual leather straps with gold ring connectors for durability and style</li>
<li>Compact yet spacious enough for phone, wallet, keys, and daily essentials</li>
<li>Decorative gold padlock charm for an exclusive finishing detail</li>
</ul>
<p><strong>Perfect for:</strong> office meetings, evening outings, gifting, travel, brunches, festive occasions, and elevated daily wear.</p>
<h3>Ratings &amp; Reviews</h3>
<p><strong>Overall rating:</strong> 4.8 / 5</p>
<ul>
<li><strong>Priya M., Mumbai:</strong> Absolutely stunning bag. The gold hardware feels premium and the canvas feels incredibly high quality. Worth every rupee.</li>
<li><strong>Sneha R., Delhi:</strong> Gifted this to my sister and she loved it. The chain strap is sturdy and elegant, and the bag looks even more luxurious in person.</li>
<li><strong>Ananya K., Bangalore:</strong> The sage green color is unique and chic. It fits phone, wallet, keys, and even a small notebook comfortably.</li>
<li><strong>Ritu S., Pune:</strong> Elegant and well made. The leather trim feels soft and genuine. I only wish it came in more colors.</li>
</ul>$$,
  'Elevate your everyday style with the Salvage Sage Satchel, a handcrafted handbag blending sage canvas, genuine leather, gold hardware, and a detachable chain strap for timeless elegance.',
  'Yasar',
  'Yasar',
  'Ladies Bag',
  'Ladies Bag',
  ARRAY['ladies bag','luxury bag','satchel','canvas bag','leather handbag','crossbody bag','gift for women','office bag','gold hardware bag','yasar'],
  '/yasar/2/render-10.png',
  'active',
  'yasar',
  'BAGS-001',
  'Buy Luxury Sage Canvas Leather Satchel Bag Online | Premium Women''s Handbag',
  'Shop the Salvage Sage Satchel, a luxury canvas and leather handbag with gold chain strap and artisan stitch detailing. Perfect gift for women.',
  'BAGS-001',
  1500,
  2143,
  100,
  'Luxury sage green canvas and brown leather satchel handbag with gold chain strap for women',
  ARRAY[
    '/yasar/2/render-10.png',
    '/yasar/2/render-11.png',
    '/yasar/2/render-12.png',
    '/yasar/2/render-13.jpg.jpeg',
    '/yasar/2/render-13.png',
    '/yasar/2/render-20.png',
    '/yasar/2/render-21.jpg.jpeg',
    '/yasar/2/render-24.jpg.jpeg',
    '/yasar/2/render-25.jpg.jpeg',
    '/yasar/2/render-26.jpg.jpeg',
    '/yasar/2/render-27.jpg.jpeg',
    '/yasar/2/render-28.jpg.jpeg',
    '/yasar/2/render-29.jpg.jpeg',
    '/yasar/2/render-30.jpg.jpeg',
    '/yasar/2/render-31.jpg.jpeg',
    '/yasar/2/render-32.jpg.jpeg',
    '/yasar/2/render-33.jpg.jpeg',
    '/yasar/2/render-34.jpg.jpeg',
    '/yasar/2/render-35.jpg.jpeg',
    '/yasar/2/render-36.jpg.jpeg',
    '/yasar/2/render-37.jpg.jpeg',
    '/yasar/2/render-38.jpg.jpeg',
    '/yasar/2/render-39.jpg.jpeg',
    '/yasar/2/render-40.jpg.jpeg',
    '/yasar/2/render-41.jpg.jpeg',
    '/yasar/2/render-42.jpg.jpeg',
    '/yasar/2/render-43.jpg.jpeg',
    '/yasar/2/render-44.jpg.jpeg',
    '/yasar/2/render-45.jpg.jpeg',
    '/yasar/2/render-48.jpg.jpeg',
    '/yasar/2/render-51.jpg.jpeg',
    '/yasar/2/render-58.jpg.jpeg',
    '/yasar/2/render-6.png',
    '/yasar/2/render-67.jpg.jpeg',
    '/yasar/2/render-7.png',
    '/yasar/2/render-73.jpg.jpeg',
    '/yasar/2/render-79.jpg.jpeg',
    '/yasar/2/render-8.png',
    '/yasar/2/render-9.png'
  ]
),
(
  'mru-luna-arc-luxury-half-moon-canvas-leather-handbag-women',
  'mru-luna-arc-luxury-half-moon-canvas-leather-handbag-women',
  'Luxury Olive Canvas & Leather Half-Moon Tote Bag | Women''s Premium Top Handle Crossbody Handbag',
  $$<p>Introducing a sculptural statement handbag inspired by the graceful arc of the moon. This half-moon silhouette is designed for the modern woman who values originality, quality, and timeless style.</p>
<p><strong>A shape like no other:</strong> This bag stands apart with its distinctive crescent body, premium olive canvas exterior, and rich tan-brown genuine leather trims that create a refined earthy palette.</p>
<h3>Premium Materials &amp; Construction</h3>
<ul>
<li>Exterior: Premium thick-weave olive canvas</li>
<li>Trims &amp; edging: Full genuine tan leather border piping</li>
<li>Top handles: Circular leather ring handles</li>
<li>Shoulder strap: Detachable adjustable genuine leather crossbody strap</li>
<li>Hardware: Polished silver-tone metal clasps and zipper pulls</li>
<li>Charm accessory: Decorative rope and wooden bead keyring charm</li>
<li>Closure: Top zip closure for secure carry</li>
</ul>
<h3>Design Highlights</h3>
<ul>
<li>Half-moon sculptural silhouette for an artistic look</li>
<li>Dual circular leather top handles for structured hand carry</li>
<li>Full leather edge piping for durability and luxury finish</li>
<li>Detachable leather shoulder strap for versatile styling</li>
<li>Interior zip compartment and side zip pocket for organization</li>
<li>Lightweight yet structured enough for all-day comfort</li>
</ul>
<p><strong>Perfect for:</strong> weekend outings, brunches, travel, gifting, office wear, and festive events.</p>
<h3>Ratings &amp; Reviews</h3>
<p><strong>Overall rating:</strong> 4.9 / 5</p>
<ul>
<li><strong>Kavya S., Mumbai:</strong> The circular handles are so unique and the leather quality is outstanding. A real head-turner.</li>
<li><strong>Meera T., Hyderabad:</strong> The half-moon shape is even more beautiful in person. The canvas feels thick and premium.</li>
<li><strong>Ishita N., Delhi:</strong> Bought this as a gift and the presentation felt boutique-level. It made a huge impression.</li>
<li><strong>Pooja V., Chennai:</strong> Exceptional quality and very versatile as both a top-handle and crossbody bag.</li>
</ul>$$,
  'The MRU Luna Arc is a premium half-moon handbag crafted from olive canvas and genuine tan leather, finished with ring handles, a detachable crossbody strap, silver hardware, and a decorative rope charm.',
  'Yasar',
  'Yasar',
  'Ladies Bag',
  'Ladies Bag',
  ARRAY['ladies bag','half moon bag','luxury handbag','canvas leather bag','ring handle tote','crossbody bag women','olive bag','premium gift for her','yasar'],
  '/yasar/3/render-109.jpg.jpeg',
  'active',
  'yasar',
  'BAGS-002',
  'Buy MRU Luna Arc Luxury Half-Moon Canvas Handbag | Premium Women''s Tote Online India',
  'Shop MRU Luna Arc, a luxury olive canvas and leather half-moon handbag with ring handles, crossbody strap, and rope charm.',
  'BAGS-002',
  1199,
  1713,
  100,
  'Luxury olive green canvas half-moon handbag with circular leather handles and detachable crossbody strap for women',
  ARRAY[
    '/yasar/3/render-109.jpg.jpeg',
    '/yasar/3/render-111.jpg.jpeg',
    '/yasar/3/render-126.jpg.jpeg',
    '/yasar/3/render-135.jpg.jpeg',
    '/yasar/3/render-14.png',
    '/yasar/3/render-142.jpg.jpeg',
    '/yasar/3/render-15.png',
    '/yasar/3/render-156.jpg.jpeg',
    '/yasar/3/render-17.png',
    '/yasar/3/render-18.png',
    '/yasar/3/render-19.png',
    '/yasar/3/render-21.png',
    '/yasar/3/render-23.png',
    '/yasar/3/render-26.png',
    '/yasar/3/render-28.png',
    '/yasar/3/render-46.jpg.jpeg',
    '/yasar/3/render-47.jpg.jpeg',
    '/yasar/3/render-49.jpg.jpeg',
    '/yasar/3/render-50.jpg.jpeg',
    '/yasar/3/render-52.jpg.jpeg',
    '/yasar/3/render-53.jpg.jpeg',
    '/yasar/3/render-54.jpg.jpeg',
    '/yasar/3/render-55.jpg.jpeg',
    '/yasar/3/render-56.jpg.jpeg',
    '/yasar/3/render-57.jpg.jpeg',
    '/yasar/3/render-60.jpg.jpeg',
    '/yasar/3/render-62.jpg.jpeg',
    '/yasar/3/render-63.jpg.jpeg',
    '/yasar/3/render-64.jpg.jpeg',
    '/yasar/3/render-65.jpg.jpeg',
    '/yasar/3/render-66.jpg.jpeg',
    '/yasar/3/render-69.jpg.jpeg',
    '/yasar/3/render-72.jpg.jpeg',
    '/yasar/3/render-82.jpg.jpeg',
    '/yasar/3/render-98.jpg (1).jpeg',
    '/yasar/3/render-98.jpg.jpeg'
  ]
),
(
  'lk-fashion-lr-noir-luxury-monogram-barrel-cylinder-bag-women',
  'lk-fashion-lr-noir-luxury-monogram-barrel-cylinder-bag-women',
  'Luxury Monogram Canvas Cylinder Barrel Bag | Women''s Premium Top Handle & Crossbody Vanity Bag with Gold Hardware',
  $$<p>Unveiling a couture-inspired cylindrical vanity bag crafted for the woman who does not follow trends, but sets them. Every detail, from the all-over monogram jacquard canvas to the polished gold-tone hardware, is built to deliver a high-fashion finish.</p>
<p><strong>Couture meets structure:</strong> The rigid barrel silhouette is wrapped in premium beige and black monogram canvas, bordered with smooth black leather panels at the top and base for a polished, shape-holding finish.</p>
<h3>Premium Materials &amp; Construction</h3>
<ul>
<li>Exterior: Signature monogram jacquard canvas in beige and black</li>
<li>Leather panels: Smooth black genuine leather top and base trim</li>
<li>Hardware: Gold-tone metal zippers, clasps, and connector rings</li>
<li>Top handle: Structured black leather top handle</li>
<li>Shoulder straps: One detachable wide silk-print crossbody strap plus one detachable black leather adjustable strap</li>
<li>Closure: Full perimeter gold zip closure</li>
<li>Interior: Spacious barrel interior with zip and slip pockets</li>
</ul>
<h3>Signature Design Features</h3>
<ul>
<li>Iconic cylindrical barrel shape with strong structure</li>
<li>All-over monogram canvas for a couture-inspired finish</li>
<li>Dual strap system for casual or formal styling</li>
<li>Gold rivet details and structured handle for a luxury look</li>
<li>Compact yet spacious enough for essentials and cosmetics</li>
</ul>
<p><strong>Perfect for:</strong> evening events, festive wear, travel, date nights, gifting, brunches, and occasions where you want a statement accessory.</p>
<h3>Ratings &amp; Reviews</h3>
<p><strong>Overall rating:</strong> 4.9 / 5</p>
<ul>
<li><strong>Nisha A., Mumbai:</strong> The monogram canvas looks premium and the gold zippers feel incredibly solid. A true occasion bag.</li>
<li><strong>Divya R., Delhi:</strong> The craftsmanship and high-end feel stand out immediately. The silk strap and leather trim make it feel very polished.</li>
<li><strong>Aisha K., Bangalore:</strong> The two strap options make it easy to switch between casual and formal looks.</li>
<li><strong>Rhea M., Pune:</strong> Gifted this to my mother and the finish, packaging, and gold plaque made it feel luxurious.</li>
<li><strong>Sanya P., Chennai:</strong> Beautiful structure and quality. The monogram canvas holds shape very well.</li>
</ul>$$,
  'The LK & Fashion LR Noir Barrel Bag is a couture-inspired cylindrical vanity bag featuring monogram jacquard canvas, black leather trims, gold-tone hardware, and two detachable straps for versatile luxury styling.',
  'Yasar',
  'Yasar',
  'Ladies Bag',
  'Ladies Bag',
  ARRAY['ladies bag','barrel bag','cylinder bag','monogram bag','vanity bag','luxury handbag','gold zipper bag','crossbody women','designer inspired bag','yasar'],
  '/yasar/4/render-102.jpg.jpeg',
  'active',
  'yasar',
  'BAGS-003',
  'Buy LK & Fashion LR Noir Luxury Monogram Barrel Bag | Premium Women''s Vanity Handbag India',
  'Shop a luxury monogram canvas cylinder barrel bag with gold hardware and dual straps. Couture-inspired design for elevated styling.',
  'BAGS-003',
  1299,
  1856,
  100,
  'Luxury monogram canvas cylinder barrel vanity bag with gold zipper and black leather trim for women',
  ARRAY[
    '/yasar/4/render-102.jpg.jpeg',
    '/yasar/4/render-113.jpg.jpeg',
    '/yasar/4/render-129.jpg.jpeg',
    '/yasar/4/render-139.jpg.jpeg',
    '/yasar/4/render-148.jpg.jpeg',
    '/yasar/4/render-16.png',
    '/yasar/4/render-197.jpg.jpeg',
    '/yasar/4/render-24.png',
    '/yasar/4/render-25.png',
    '/yasar/4/render-61.jpg.jpeg',
    '/yasar/4/render-87.jpg.jpeg',
    '/yasar/4/render-89.jpg (1).jpeg',
    '/yasar/4/render-89.jpg.jpeg'
  ]
);

INSERT INTO public.products (
  handle,
  slug,
  title,
  description,
  short_description,
  vendor,
  brand,
  category,
  product_type,
  tags,
  main_image,
  status,
  supplier_name,
  supplier_product_code,
  seo_title,
  seo_description
)
SELECT
  handle,
  slug,
  title,
  description,
  short_description,
  vendor,
  brand,
  category,
  product_type,
  tags,
  main_image,
  status,
  supplier_name,
  supplier_product_code,
  seo_title,
  seo_description
FROM tmp_ladies_bag_seed
ON CONFLICT (handle) DO UPDATE
SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  vendor = EXCLUDED.vendor,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  product_type = EXCLUDED.product_type,
  tags = EXCLUDED.tags,
  main_image = EXCLUDED.main_image,
  status = EXCLUDED.status,
  supplier_name = EXCLUDED.supplier_name,
  supplier_product_code = EXCLUDED.supplier_product_code,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

DELETE FROM public.variants
WHERE product_id IN (
  SELECT p.id
  FROM public.products p
  INNER JOIN tmp_ladies_bag_seed s ON s.handle = p.handle
);

DELETE FROM public.product_images
WHERE product_id IN (
  SELECT p.id
  FROM public.products p
  INNER JOIN tmp_ladies_bag_seed s ON s.handle = p.handle
);

INSERT INTO public.variants (
  product_id,
  sku,
  option1_name,
  option1_value,
  price_selling,
  price_compare,
  barcode,
  weight_grams,
  inventory_quantity,
  is_default,
  status,
  gst_percent,
  supplier_name,
  supplier_sku
)
SELECT
  p.id,
  s.sku,
  'Title',
  'Default Title',
  s.price_selling,
  s.price_compare,
  '',
  0,
  s.inventory_quantity,
  true,
  'active',
  NULL,
  'wukusy',
  s.sku
FROM tmp_ladies_bag_seed s
INNER JOIN public.products p ON p.handle = s.handle;

INSERT INTO public.product_images (
  product_id,
  src,
  position,
  alt_text
)
SELECT
  p.id,
  img.src,
  img.position::integer,
  s.alt_text
FROM tmp_ladies_bag_seed s
INNER JOIN public.products p ON p.handle = s.handle
CROSS JOIN LATERAL unnest(s.images) WITH ORDINALITY AS img(src, position);

DROP TABLE IF EXISTS tmp_ladies_bag_seed;

COMMIT;
