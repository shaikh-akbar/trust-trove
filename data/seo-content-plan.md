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
