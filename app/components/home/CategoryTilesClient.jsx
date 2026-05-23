"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";

const CATEGORY_FALLBACK_IMAGES = {
  bracelets:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/whl135_30472_bracelet/Kzdd9VnPbzCG3u95uLDbB7Kd55E5EHsMUxZL4Gbm_thumb.jpeg",
  chocolates:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/0026_kulfi_almond_ka96/jPQxlsI9yBVuGpxKNpz1RsxhU6Bqa4Ehf3Yo6dOy_thumb.jpeg",
  electronics:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/14016_rabbit_wooden_mobile_stand/21lhiVqkw8Yx1m2gX6Wef8NGnWCtFrKh5vdxCBQr_thumb.jpeg",
  foods:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/5991a_vishwas_cotton_oil_pouch/zlCBJCP045kqYmpZhXUTzrtbWjCT1Cl67O5ZQuMo_thumb.jpeg",
  "mobile accessories":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/13847_120w_type_c_fast_charge_cable_no1/qFUUPRbacbhRGe6jNHP7l1nhybGxgd0N1Nlie8Pb_thumb.jpeg",
  "home & kitchen":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/748_Plastic_Glass_Wiper/748_Plastic_Glass_Wiper_1_thumb.jpg",
  "kitchen tool":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/0108_big_rice_bowl/0108_big_rice_bowl_1_thumb.jpg",
  "home improvement":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/4695_heavy_washing_machine_stand_4pc/PV63qWq8i9T2fcCxwFtPuAUsKaQIInuoGS1pSccB_thumb.jpeg",
  "home decor":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/0052_space_compass_box/xTkCb5EDETaVYinM30AsDsZol0KI2Bpe8bAECZVX_thumb.jpeg",
  garden:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/15792_mini_folding_pruning_saw_15inch/pdSRKXc6ki25Z9s2K58Mi8Zhvsm9xMCNXiFDgECQ_thumb.jpeg",
  hardware:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/15759_multi_ratchet_screwdriver_set/DHBogpJ331ZVQdJDEcahYRLdJj2fBZN33Z20NKJG_thumb.jpeg",
  toys:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/18485_daily_calendar_puzzle_pz1016/onvkjq3ur41vzjW0nWYvs5swqjwBxrkabZajSIUn_thumb.jpeg",
  sports:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/15012_hand_football_pump_1pc_no1/hVUfmt3R5CSG7R5kRYmaSPayNfqTwOdRF0JSluu5_thumb.jpeg",
  fashion:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/whl181_60981_jys_rakhi_c11/YWGE9adONC7q1tanNM6xaSSJ12q1YPWn3NwRrYhj_thumb.jpeg",
  travel:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/13906_ss_folding_4_finger_ring/i9ipL4LjDRPn6EttekNaeIuuyYpg3qTRDgzcPJIh_thumb.jpeg",
  accessories:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/whl135_19764_cartoon_design_keychain_1pc_g/uO5mp9jHB1Wp99bgd1nru4NTOZUAR8c54KEb2JKo_thumb.jpeg",
  "health care":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/0979_oily_skin_face_wipes/FlCbdASZg0LLfEB7ON3xqiEizvppzds6u26ajmfr_thumb.jpeg",
  "baby care":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/4964_candy_baby_silicone_teether_pt29/uzj1Oho5UhSld4YdTVRPR5lMDZMdEgPmF69Yqpae_thumb.jpeg",
  office:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/7907_4in1_cmp_compass_box_no6/Y5swpPdoJ2XpY6tdKdijNQPanjTc7ovBa5lgMWX1_thumb.jpeg",
  automotive:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/15020_48v_car_washer_gun_n_small_box/fSS84iuIGfR76Wfri1hKTDbPSXlDmhTvlPQ9wewg_thumb.jpeg",
  "face & body care":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/0338_nose_clip/0338_nose_clip_1_thumb.jpg",
  "health & beauty":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/1252_oval_stone_scrubber/HlCnhPGa00n7mu0Eo1b3kPIBfEKYO48T1WHP0Wpx_thumb.jpeg",
  kids:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/2009_12Inch_Folding_Stool/2009_12Inch_Folding_Stool_1_thumb.jpg",
  "other products":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/5035_lucky_box_value_2500/vcraRNNE7wQVVLxXSkq3aQz8eqoXnBoP1rq9sc5Y_thumb.jpeg",
  "power & hand tools":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/451_24pcs%20T%20shape%20screwdriver/451_24pcs%20T%20shape%20screwdriver_1_thumb.jpg",
  "hardware fittings":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/8641_hole_saw_installation_kit_no6/1neoUXFHo6ISMT9FcqHGoNDo8wFsdxnDL99j7Qle_thumb.jpeg",
  services:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/905_12X14_180_M1/905_12X14_180_M1_1_thumb.jpg",
  watches:
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/12481_stylish_womens_wrist_watch_1pc_no1/V5o3JJkjrd6HeC8w018rbBAUnp33IF5wRvyRoctb_thumb.jpeg",
};

const CATEGORY_DEFAULT_IMAGES_BY_SLUG = {
  automative: "/category/automative.png",
  automotive: "/category/automative.png",
  electronics: "/category/electronics.png",
  "health-and-beauty":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/1252_oval_stone_scrubber/HlCnhPGa00n7mu0Eo1b3kPIBfEKYO48T1WHP0Wpx_thumb.jpeg",
  "health-care":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/0979_oily_skin_face_wipes/FlCbdASZg0LLfEB7ON3xqiEizvppzds6u26ajmfr_thumb.jpeg",
  jewellery: "/category/jewellery.png",
  "home-kitchen": "/category/home-kitchen.png",
  "home-and-kitchen": "/category/home-kitchen.png",
  "mobile-accessories": "/category/mobile-accessoires.png",
  office: "/category/office.png",
  "other-products":
    "https://d3np62i3isvr1h.cloudfront.net/catalog/products/5035_lucky_box_value_2500/vcraRNNE7wQVVLxXSkq3aQz8eqoXnBoP1rq9sc5Y_thumb.jpeg",
};

function buildCategoryDescription(category) {
  if (category?.description) {
    return category.description;
  }

  return `Browse ${category.title} products with a cleaner focused layout and faster entry into related products.`;
}

function formatProductCount(count) {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

function getCategoryImage(category) {
  const normalizedSlug = String(category?.slug || "").trim().toLowerCase();
  const defaultImage = CATEGORY_DEFAULT_IMAGES_BY_SLUG[normalizedSlug];

  if (defaultImage) {
    return defaultImage;
  }

  const explicitImage = String(category?.image || "").trim();

  if (explicitImage) {
    return explicitImage;
  }

  const normalizedTitle = String(category?.title || "").trim().toLowerCase();
  return CATEGORY_FALLBACK_IMAGES[normalizedTitle] || "";
}

export default function CategoryTilesClient({ categories }) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sortedCategories = [...categories].sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.title.localeCompare(right.title);
    });

    if (!normalizedQuery) {
      return sortedCategories;
    }

    return sortedCategories.filter((category) => {
      const searchableText = [category.title, category.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [categories, query]);

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[0_24px_70px_-52px_rgba(20,29,96,0.18)] sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--brand-navy)]/45">
            {filteredCategories.length} categories
          </p>
          <p className="mt-1 text-sm text-slate-500">Search category name and jump directly into that collection.</p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search category"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-navy)] focus:bg-white"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear category search"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <p className="text-lg font-semibold text-slate-700">No category matched your search.</p>
          <p className="mt-2 text-sm text-slate-500">Try a different category name or clear the search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#faf7f2_100%)] p-3 text-center shadow-[0_16px_34px_-30px_rgba(20,29,96,0.16)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_-30px_rgba(20,29,96,0.22)] sm:p-4"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--surface-soft)] bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_50%,#fff7ed_100%)] shadow-[0_18px_32px_-24px_rgba(20,29,96,0.24)] sm:h-32 sm:w-32">
                {getCategoryImage(category) ? (
                  <img
                    src={getCategoryImage(category)}
                    alt={category.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="px-4 text-center font-display text-lg font-semibold leading-tight text-[var(--brand-navy)] sm:text-xl">
                    {category.title}
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold leading-tight text-[var(--brand-navy)] sm:text-lg">
                {category.title}
              </h3>
              <p className="mt-2 inline-flex rounded-full border border-[var(--brand-navy)]/12 bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--brand-navy)]/72">
                {formatProductCount(category.count)}
              </p>
              <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500 sm:text-sm">
                {buildCategoryDescription(category)}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--brand-navy)]/56">
                <span>Explore category</span>
                <ArrowRight size={12} className="transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

