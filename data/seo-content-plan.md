# GoModexa SEO Content Plan

This plan is aligned to the current storefront and content implementation in the repo.

## Live Route Map

- Main shop: `/shop`
- Product pages: `/product/[slug]`
- Categories: `/categories/[slug]`
- Brands: `/brands/[slug]`
- Blog index: `/blogs`
- Blog detail: `/blogs/[slug]`

## How This Repo Currently Supports SEO Content

- Blog posts are stored in `lib/content.js` under `BLOG_POSTS`.
- Blog pages already output metadata and `BlogPosting` schema.
- Category pages already surface related guides from matching blog categories.
- Product-led posts can link directly into a `productSource.productPath`.

That means the fastest SEO wins are:
- Publish more category-level buying guides.
- Add more product-led review guides for high-intent products.
- Keep category names in blog posts consistent with storefront category titles.

## Status Snapshot

This is the current status of the original 30-topic plan.

| # | Topic | Status | Notes |
|---|---|---|---|
| 1 | Best Mobile Accessories For Everyday Use In India | Published | Live in `BLOG_POSTS` |
| 2 | Best Mobile Stands For Desk Work, Study, And Streaming | Partial | Covered by `Best Mobile Stand Features To Look For While Working, Studying, Or Streaming` |
| 3 | Best Home And Kitchen Products For Small Indian Homes | Published | Live in `BLOG_POSTS` |
| 4 | Best Kitchen Tools To Make Daily Cooking Easier | Published | Live in `BLOG_POSTS` |
| 5 | Best Electronics Products For Daily Use And Gifting | Published | Live in `BLOG_POSTS` |
| 6 | Best Health And Beauty Products For Daily Routine | Published | Live in `BLOG_POSTS` |
| 7 | Best Face And Body Care Products For Everyday Self Care | Not started | Good cluster expansion for Health & Beauty |
| 8 | Best Office Accessories For A More Productive Desk Setup | Published | Live in `BLOG_POSTS` |
| 9 | Best Travel Accessories For Smarter Packing | Published | Live in `BLOG_POSTS` |
| 10 | Best Automotive Accessories For Daily Convenience | Not started | Product-led auto guides exist, but not the broad category guide |
| 11 | Best Fashion Accessories To Upgrade Daily Outfits | Published | Live in `BLOG_POSTS` |
| 12 | Best Watches To Gift Or Wear Every Day | Published | Live in `BLOG_POSTS` |
| 13 | Best Baby Care Products For New Parents | Not started | Needs a category-level guide |
| 14 | Best Toys For Everyday Play And Gifting | Not started | Needs a category-level guide |
| 15 | Best Kids Products For Daily Use And School Time | Not started | Needs a category-level guide |
| 16 | Best Sports Products For Home Fitness And Activity | Not started | Needs a category-level guide |
| 17 | Best Garden Utility Products For Home Use | Partial | Product-led garden guide exists, broad category guide does not |
| 18 | Best Home Decor Products To Refresh A Room | Not started | Needs a category-level guide |
| 19 | Best Home Improvement Products Worth Buying Online | Not started | Needs a category-level guide |
| 20 | Best Hardware And Utility Products For Everyday Fixes | Not started | Needs a category-level guide |
| 21 | Best Power And Hand Tools For Home Projects | Not started | Needs a category-level guide |
| 22 | Best Health Care Products For Everyday Wellness | Not started | Separate from Health & Beauty cluster |
| 23 | Best Accessories To Keep At Home, Work, And Travel | Not started | Broad support page for `/categories/accessories` |
| 24 | Best Food And Snack Products To Keep At Home | Not started | Useful commercial-intent category page support |
| 25 | Best Chocolate Gift Options For Small Surprises | Not started | Good gifting-intent category guide |
| 26 | Best Utility Products That Make Daily Life Easier | Not started | Strong homepage/shop support content |
| 27 | What To Check Before Buying A Body Spray Online | Published | Live in `BLOG_POSTS` |
| 28 | What To Check Before Buying A Kitchen Tool Online | Partial | `Best Kitchen Tools To Make Daily Cooking Easier` covers similar intent |
| 29 | What Makes An Online Store Feel Trustworthy Before Checkout | Published | Live as a close variant |
| 30 | How To Choose Better Everyday Products Without Overspending | Partial | Similar intent exists, but not the exact title |

## Priority Queue

Publish these next because they fill the biggest category gaps with clean commercial intent:

| Priority | Target Title | Primary Keyword | Main Link Target |
|---|---|---|---|
| 1 | Best Automotive Accessories For Daily Convenience | best automotive accessories online India | `/categories/automotive` |
| 2 | Best Face And Body Care Products For Everyday Self Care | best face and body care products | `/categories/face-and-body-care` |
| 3 | Best Baby Care Products For New Parents | best baby care products online India | `/categories/baby-care` |
| 4 | Best Toys For Everyday Play And Gifting | best toys online India | `/categories/toys` |
| 5 | Best Kids Products For Daily Use And School Time | best kids products online India | `/categories/kids` |
| 6 | Best Sports Products For Home Fitness And Activity | best sports products online India | `/categories/sports` |
| 7 | Best Garden Utility Products For Home Use | best garden tools online India | `/categories/garden` |
| 8 | Best Home Decor Products To Refresh A Room | best home decor products online India | `/categories/home-decor` |
| 9 | Best Home Improvement Products Worth Buying Online | best home improvement products online | `/categories/home-improvement` |
| 10 | Best Utility Products That Make Daily Life Easier | best utility products for home use | `/categories/utilities` |

## Secondary Queue

These are strong follow-ups once the category gaps above are filled:

- Best Hardware And Utility Products For Everyday Fixes
- Best Power And Hand Tools For Home Projects
- Best Health Care Products For Everyday Wellness
- Best Accessories To Keep At Home, Work, And Travel
- Best Food And Snack Products To Keep At Home
- Best Chocolate Gift Options For Small Surprises

## Product-Led Content Lane

The repo already supports product-led articles well. Keep shipping these alongside category guides.

Best current product-led patterns:
- `[Product Name]: A Practical [Use Case] Guide`
- `[Product Name] Review`
- `What To Check Before You Buy [Product Name]`

Good current examples already in `BLOG_POSTS`:
- `Car Dashboard Scratch Remover Tissue (80 Pcs Set): A Practical Car Cleaning Guide`
- `Mens Deodorant Body Spray 150ml ... : A Practical Daily Fragrance Guide`
- `Portable Car Air Mattress Bed Set ... : A Practical Road Trip Sleep Guide`
- `Premium Women Travel Hygiene Essentials Combo (1 Set): A Practical Travel Utility Guide`

## Immediate Product-Led SEO Blog Queue

Use these next. They fit the current product-led format well and map cleanly to existing category clusters.

| Product | Price | Suggested Category | Recommended Blog Title | Primary Keyword | Product URL |
|---|---|---|---|---|---|
| Protective Bike Goggle Face Mask Detachable Riding Glasses Dust Proof - 1 Pc | Rs 262 | Automotive | Protective Bike Goggle Face Mask Detachable Riding Glasses Dust Proof - 1 Pc: A Practical Riding Protection Guide | bike goggle face mask review | `https://www.gomodexa.com/product/protective-bike-goggle-face-mask-detachable-riding-glasses-dust-proof-1-pc-20940` |
| Liger Gym Shaker Bottle - Approx 800ml, 1 Pc | Rs 108 | Sports | Liger Gym Shaker Bottle - Approx 800ml, 1 Pc: A Practical Gym Hydration And Mixing Guide | gym shaker bottle review | `https://www.gomodexa.com/product/liger-gym-shaker-bottle-approx-800ml-1-pc-13953` |
| Inflatable Air Lounger Sofa For Pool Beach Camping - 1 Pc | Rs 546 | Travel | Inflatable Air Lounger Sofa For Pool Beach Camping - 1 Pc: A Practical Outdoor Comfort Guide | inflatable air lounger sofa review | `https://www.gomodexa.com/product/inflatable-air-lounger-sofa-for-pool-beach-camping-1-pc-20728` |
| 188 1000W-220V Water Heater Portable Electric Immersion Element Boiler | Rs 245 | Home Improvement | 188 1000W-220V Water Heater Portable Electric Immersion Element Boiler: A Practical Portable Water Heating Guide | portable immersion water heater review | `https://www.gomodexa.com/product/188-1000w-220v-water-heater-portable-electric-immersion-element-boiler-124` |

### Recommended SEO Angles For These Products

#### 1. Protective Bike Goggle Face Mask Detachable Riding Glasses Dust Proof - 1 Pc

- Search intent:
  buyers looking for bike riding face protection, dust protection, detachable riding goggles, and budget bike accessories.
- Supporting keywords:
  `bike riding mask with goggles`, `dust proof face mask for bike riders`, `riding glasses with face mask`, `budget bike accessories online India`.
- Suggested meta description:
  `Looking for a protective bike goggle face mask with detachable riding glasses? Explore how this dust-proof riding accessory supports everyday bike travel, comfort, and outdoor protection.`
- Content angle:
  focus on dust protection, road-use comfort, face coverage, visibility support, and why riders search for compact protective accessories instead of bulky gear.
- Internal links:
  `/categories/automotive`, `/shop`, and the direct product page.

#### 2. Liger Gym Shaker Bottle - Approx 800ml, 1 Pc

- Search intent:
  buyers comparing gym shaker bottles for protein mixing, pre-workout use, hydration, portability, and low-cost fitness accessories.
- Supporting keywords:
  `best gym shaker bottle online India`, `protein shaker bottle 800ml`, `gym bottle for protein shakes`, `affordable gym accessories India`.
- Suggested meta description:
  `Thinking about the Liger Gym Shaker Bottle 800ml? Learn what to check in bottle size, mixing convenience, gym portability, and everyday workout hydration before you buy.`
- Content angle:
  emphasize capacity, easy carry, daily gym use, shake-mixing convenience, and why low-ticket fitness products can still attract high-intent search traffic.
- Internal links:
  `/categories/sports`, `/shop`, and the direct product page.

#### 3. Inflatable Air Lounger Sofa For Pool Beach Camping - 1 Pc

- Search intent:
  buyers searching for portable outdoor comfort for beach trips, camping, poolside lounging, and lightweight travel relaxation products.
- Supporting keywords:
  `inflatable air lounger sofa review`, `portable lounger for beach camping`, `air sofa for outdoor travel`, `camping comfort products online India`.
- Suggested meta description:
  `Explore whether this inflatable air lounger sofa is a smart pick for poolside use, beach trips, camping comfort, and portable outdoor relaxation.`
- Content angle:
  cover portability, setup convenience, comfort during outdoor breaks, travel-friendliness, and why products like this work well inside the Travel content cluster.
- Internal links:
  `/categories/travel`, `/shop`, and the direct product page.

#### 4. 188 1000W-220V Water Heater Portable Electric Immersion Element Boiler

- Search intent:
  buyers looking for portable water heating solutions for quick bucket heating, travel utility, hostel use, and budget home-use heating tools.
- Supporting keywords:
  `portable immersion rod review`, `1000W water heater element boiler`, `electric immersion heater for bucket water`, `budget home utility products India`.
- Suggested meta description:
  `Considering this 1000W portable electric immersion element boiler? Learn what to check in quick water heating utility, compact storage, and everyday household use before buying.`
- Content angle:
  focus on compact utility, quick water-heating use cases, small-home practicality, hostel or rental-home relevance, and how product-led content can support the Home Improvement category.
- Internal links:
  `/categories/home-improvement`, `/shop`, and the direct product page.

## Ready-To-Write Titles From This Batch

These titles are the strongest first pass if the goal is commercial SEO with clean product matching:

1. `Protective Bike Goggle Face Mask Detachable Riding Glasses Dust Proof - 1 Pc: A Practical Riding Protection Guide`
2. `Liger Gym Shaker Bottle - Approx 800ml, 1 Pc: A Practical Gym Hydration And Mixing Guide`
3. `Inflatable Air Lounger Sofa For Pool Beach Camping - 1 Pc: A Practical Outdoor Comfort Guide`
4. `188 1000W-220V Water Heater Portable Electric Immersion Element Boiler: A Practical Portable Water Heating Guide`

## Supporting Cluster Ideas Around This Batch

Use these as follow-up posts so the product articles are not isolated:

- `Best Bike And Car Accessories Online In India For Daily Utility And Road Comfort`
- `Best Sports Products For Home Fitness And Daily Workout Routines`
- `Best Travel Comfort Products Online In India For Beach Trips, Camping, And Outdoor Breaks`
- `Best Home Improvement Products Online In India For Small Utility Needs And Everyday Fixes`

## Best Publishing Order For These 4 Products

1. Publish the bike goggle face mask article first to strengthen the Automotive cluster.
2. Publish the gym shaker bottle article next to add a lower-ticket Sports product with clear buying intent.
3. Publish the inflatable air lounger sofa article third to support Travel with seasonal outdoor-use intent.
4. Publish the portable immersion heater article fourth to support Home Improvement and utility-led search traffic.

## Internal Linking Rules

Match the current app structure when publishing each article:

- Add 1 early link to the matching category page.
- Add 1 link to `/shop`.
- Add 1 direct product link when the post is product-led.
- Add 2 to 3 related blog links at the bottom.
- Make sure the blog `category` matches the storefront category title closely enough for `getBlogPostsByCategory(...)` to connect it.

For category pages:
- Keep at least 2 to 3 related blog posts available per major category.
- Use the category guide section already rendered on `/categories/[slug]` as support copy, not as a replacement for blog content.

## Publishing Workflow

For each new post:

1. Add a new object to `BLOG_POSTS` in `lib/content.js`.
2. Set `slug`, `title`, `seoTitle`, `metaDescription`, `keywords`, `canonicalPath`, `excerpt`, `category`, `readingTime`, `publishedAt`, and `body`.
3. Add `productSource` when the article should feature a specific product page.
4. Keep the blog `canonicalPath` in `/blogs/[slug]` format.
5. Reuse a category title that maps cleanly to `/categories/[slug]`.

## Weekly Cadence

- Publish 2 category-level guides per week.
- Publish 2 product-led review guides per week.
- Prefer one broad category guide plus one tightly matched product guide in the same cluster.

Suggested short cycle:
- Week 1: Automotive + one automotive product review
- Week 2: Face And Body Care + one body-care product review
- Week 3: Baby Care + one baby-care product review
- Week 4: Toys or Kids + one matching product review

## Measurement Checklist

Track these after each batch goes live:

- Indexed blog URL count
- Impressions by blog page
- Queries by blog page
- CTR for linked category pages
- Growth in internal links from blogs to categories and products
- Whether each major category has at least 2 supporting guides
