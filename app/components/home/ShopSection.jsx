'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

const PAGE_SIZE = 8;

const CATEGORY_PRESETS = [
  {
    id: 'fashion',
    label: 'Fashion',
    patterns: [/fashion/i, /clothing/i, /apparel/i, /footwear/i, /shoe/i, /watch/i, /bag/i, /jewelry/i],
  },
  {
    id: 'home-kitchen',
    label: 'Home & Kitchen',
    patterns: [/home/i, /kitchen/i, /bath/i, /garden/i, /storage/i, /decor/i, /furniture/i],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    patterns: [/electronic/i, /gadget/i, /mobile/i, /computer/i, /audio/i, /camera/i, /smart/i, /charger/i],
  },
  {
    id: 'health',
    label: 'Health',
    patterns: [/health/i, /wellness/i, /fitness/i, /sport/i, /medical/i],
  },
  {
    id: 'bpc',
    label: 'BPC',
    patterns: [/beauty/i, /cosmetic/i, /skin/i, /hair/i, /fragrance/i, /personal care/i],
  },
  {
    id: 'uncategorized',
    label: 'Uncategorized',
    patterns: [],
  },
];

function getProductTab(product) {
  const source = [product?.category, product?.product_type, product?.title, product?.name]
    .filter(Boolean)
    .join(' ');

  const matchedPreset = CATEGORY_PRESETS.find(
    (preset) => preset.id !== 'uncategorized' && preset.patterns.some((pattern) => pattern.test(source))
  );

  return matchedPreset || CATEGORY_PRESETS[CATEGORY_PRESETS.length - 1];
}

function buildTabs(products) {
  const grouped = new Map();

  products.forEach((product) => {
    const tab = getProductTab(product);
    const current = grouped.get(tab.id);

    if (current) {
      current.products.push(product);
      return;
    }

    grouped.set(tab.id, {
      ...tab,
      products: [product],
    });
  });

  return CATEGORY_PRESETS.map((preset) => grouped.get(preset.id)).filter(Boolean);
}

export default function ShopSection({ products }) {
  const tabs = useMemo(() => buildTabs(products), [products]);
  const [selectedTab, setSelectedTab] = useState(tabs[0]?.id || '');
  const [visibleCountByTab, setVisibleCountByTab] = useState(() =>
    Object.fromEntries(tabs.map((tab) => [tab.id, PAGE_SIZE]))
  );

  const activeTab = tabs.find((tab) => tab.id === selectedTab) || tabs[0];
  const activeVisibleCount = activeTab ? visibleCountByTab[activeTab.id] || PAGE_SIZE : PAGE_SIZE;
  const visibleProducts = activeTab ? activeTab.products.slice(0, activeVisibleCount) : [];
  const hasMoreProducts = activeTab ? activeTab.products.length > activeVisibleCount : false;

  function handleTabChange(tabId) {
    setSelectedTab(tabId);
    setVisibleCountByTab((current) => {
      if (current[tabId]) {
        return current;
      }

      return {
        ...current,
        [tabId]: PAGE_SIZE,
      };
    });
  }

  function handleLoadMore() {
    if (!activeTab) {
      return;
    }

    setVisibleCountByTab((current) => ({
      ...current,
      [activeTab.id]: (current[activeTab.id] || PAGE_SIZE) + PAGE_SIZE,
    }));
  }

  if (!tabs.length) {
    return (
      <div className="mt-10 rounded-3xl bg-slate-50 py-20 text-center">
        <p className="font-medium text-slate-500">No products found in the treasure trove yet.</p>
      </div>
    );
  }

  return (
    <section
      id="shop-section"
      className="relative mx-auto max-w-7xl overflow-hidden px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="absolute inset-x-4 top-6 h-56 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,#fde68a_0%,rgba(255,255,255,0)_45%),radial-gradient(circle_at_top_right,#bfdbfe_0%,rgba(255,255,255,0)_42%)] opacity-80 sm:inset-x-6 lg:inset-x-8" />

      <div className="relative rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur sm:p-7">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-amber-700">
              <Sparkles size={12} />
              Curated Picks
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-3 max-w-xl text-xs leading-5 text-slate-500 sm:text-base sm:leading-6">
              Swipe through the most-loved departments and jump into the products that fit your mood fastest.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-950 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 sm:px-5 sm:text-sm sm:tracking-[0.2em]"
          >
            View All Products
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:min-w-max sm:gap-3 sm:overflow-x-auto sm:pb-1 sm:[-ms-overflow-style:none] sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab?.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex min-h-[104px] flex-col items-start justify-between rounded-[1.25rem] border px-3 py-3 text-left transition sm:min-h-0 sm:min-w-[170px] sm:rounded-[1.5rem] sm:px-4 sm:py-4 ${
                    isActive
                      ? 'border-slate-900 bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.75)]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-[0.24em] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    Collection
                  </span>
                  <span className="mt-2 line-clamp-2 text-[11px] font-black uppercase tracking-[0.1em] sm:text-base sm:tracking-[0.12em]">
                    {tab.label}
                  </span>
                  <span className={`mt-3 text-[10px] font-semibold sm:text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {tab.products.length} products
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab ? (
          <>
            <div className="mb-6 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#eff6ff_100%)] p-4 sm:grid-cols-[1fr_auto] sm:items-end sm:rounded-[1.75rem] sm:p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 sm:text-[11px] sm:tracking-[0.24em]">
                  Active category
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                  {activeTab.label}
                </h3>
                <p className="mt-2 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                  {activeTab.products.length} products waiting in this lane. Clean picks, quicker browsing, and better mobile flow.
                </p>
              </div>
              <Link
                href="/categories"
                className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:text-slate-950 sm:text-xs sm:tracking-[0.18em]"
              >
                More collections
                <ArrowRight size={15} className="ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMoreProducts ? (
              <div className="mt-8 flex justify-center sm:mt-10">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-900 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-900 transition hover:bg-slate-900 hover:text-white sm:w-auto sm:px-8"
                >
                  Load More Products
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
