'use client';

import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { getCategorySummaryEntry } from '../../../lib/storefront';

const PAGE_SIZE = 10;

function buildTabs(products) {
  const grouped = new Map();

  products.forEach((product) => {
    const category = getCategorySummaryEntry(product);
    const current = grouped.get(category.slug);

    if (current) {
      current.products.push(product);
      current.count += 1;
      return;
    }

    grouped.set(category.slug, {
      id: category.slug,
      label: category.title,
      categoryTitle: category.title,
      count: 1,
      products: [product],
    });
  });

  return Array.from(grouped.values()).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.label.localeCompare(right.label);
  });
}

function dedupeProducts(products) {
  return Array.from(
    new Map(
      (products || []).map((product) => [
        product?.id ||
          product?.slug ||
          product?.handle ||
          `${product?.title || 'untitled'}-${product?.main_image || product?.image_url || 'no-image'}`,
        product,
      ])
    ).values()
  );
}

function formatProgressCount(visibleCount, totalCount) {
  if (!totalCount) {
    return '0 products';
  }

  return `${visibleCount} of ${totalCount} products`;
}

export default function ShopSection({
  products = [],
  tabs: providedTabs = null,
  eyebrow = "Featured Products",
  title = "Featured Products",
}) {
  const tabs = useMemo(() => {
    if (Array.isArray(providedTabs) && providedTabs.length > 0) {
      return providedTabs;
    }

    return buildTabs(products);
  }, [products, providedTabs]);
  const [selectedTab, setSelectedTab] = useState(tabs[0]?.id || '');
  const [isMobileTabMenuOpen, setIsMobileTabMenuOpen] = useState(false);
  const [tabState, setTabState] = useState(() =>
    Object.fromEntries(
      tabs.map((tab) => [
        tab.id,
        {
          products: tab.products || [],
          page: Number(tab.initialPage || (tab.products?.length ? 1 : 0)),
          isLoading: false,
        },
      ])
    )
  );

  const activeTab = tabs.find((tab) => tab.id === selectedTab) || tabs[0];
  const activeTabState = activeTab ? tabState[activeTab.id] : null;
  const visibleProducts = activeTabState?.products || activeTab?.products || [];
  const isLoadingMore = Boolean(activeTabState?.isLoading);
  const hasMoreProducts = activeTab ? visibleProducts.length < activeTab.count : false;

  function handleTabChange(tabId) {
    setSelectedTab(tabId);
    setIsMobileTabMenuOpen(false);

    const nextTab = tabs.find((tab) => tab.id === tabId);
    const nextState = nextTab ? tabState[nextTab.id] : null;

    if (nextTab && !nextState?.isLoading && (!nextState || nextState.page === 0)) {
      void loadTabPage(nextTab, 1);
    }
  }

  async function loadTabPage(tab, targetPage) {
    if (!tab) {
      return;
    }

    const currentState = tabState[tab.id] || {
      products: tab.products || [],
      page: Number(tab.initialPage || (tab.products?.length ? 1 : 0)),
      isLoading: false,
    };

    if (currentState.isLoading) {
      return;
    }

    setTabState((current) => ({
      ...current,
      [tab.id]: {
        ...currentState,
        isLoading: true,
      },
    }));

    try {
      const response = await fetch(
        `/api/products?category=${encodeURIComponent(tab.categoryTitle || tab.label)}&page=${targetPage}&pageSize=${PAGE_SIZE}`
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load more products.');
      }

      setTabState((current) => {
        const latest = current[tab.id] || currentState;
        const shouldReplace = targetPage <= 1;
        const mergedProducts = shouldReplace
          ? dedupeProducts(payload.products || [])
          : dedupeProducts([...latest.products, ...(payload.products || [])]);

        return {
          ...current,
          [tab.id]: {
            products: mergedProducts,
            page: targetPage,
            isLoading: false,
          },
        };
      });
    } catch (error) {
      console.error('Featured tab load more failed:', error);
      setTabState((current) => ({
        ...current,
        [tab.id]: {
          ...(current[tab.id] || currentState),
          isLoading: false,
        },
      }));
    }
  }

  const ensureActiveTabProducts = useEffectEvent(async () => {
    if (!activeTab) {
      return;
    }

    const currentState = tabState[activeTab.id] || {
      products: activeTab.products || [],
      page: Number(activeTab.initialPage || (activeTab.products?.length ? 1 : 0)),
      isLoading: false,
    };

    if (currentState.isLoading) {
      return;
    }

    if ((currentState.products?.length || 0) === 0 && activeTab.count > 0) {
      await loadTabPage(activeTab, 1);
    }
  });

  useEffect(() => {
    void ensureActiveTabProducts();
  }, [activeTab, tabState]);

  async function handleLoadMore() {
    if (!activeTab) {
      return;
    }

    const currentState = tabState[activeTab.id] || {
      products: activeTab.products || [],
      page: Number(activeTab.initialPage || (activeTab.products?.length ? 1 : 0)),
      isLoading: false,
    };
    const nextPage = Math.max(1, (currentState.page || 0) + 1);
    await loadTabPage(activeTab, nextPage);
  }

  if (!tabs.length) {
    return (
      <div className="mt-10 rounded-3xl bg-slate-50 py-20 text-center">
        <p className="font-medium text-slate-500">No products found in GoModexa yet.</p>
      </div>
    );
  }

  return (
    <section id="shop-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white px-4 py-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.28)] sm:px-6 sm:py-8">
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--brand-navy)]/55">{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--brand-navy)] sm:text-3xl">
            {title}
          </h2>
        </div>

        <div className="mb-5">
          <div className="mt-5 flex items-center justify-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileTabMenuOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--brand-navy)] shadow-[0_14px_34px_-26px_rgba(15,23,42,0.24)]"
            >
              {isMobileTabMenuOpen ? <X size={15} /> : <SlidersHorizontal size={15} />}
              {activeTab?.label || 'Filter Products'}
            </button>
          </div>

          {isMobileTabMenuOpen ? (
            <div className="mt-4 grid gap-2 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-3 sm:hidden">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab?.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center justify-between rounded-[1rem] border px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.16em] transition ${
                      isActive
                        ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-5 hidden overflow-x-auto pb-2 sm:block sm:[-ms-overflow-style:none] sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center gap-4">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab?.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                    isActive
                      ? 'border-[var(--brand-navy)] bg-white text-[var(--brand-navy)] shadow-[0_10px_24px_-18px_rgba(20,29,96,0.3)]'
                      : 'border-transparent bg-transparent text-slate-500 hover:text-[var(--brand-navy)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {!isActive ? <span className="ml-3 text-slate-400">›</span> : null}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {activeTab ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-4 rounded-[1.5rem] bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eff6ff_100%)] px-4 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Now showing</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-[var(--brand-navy)] sm:text-xl">{activeTab.label}</h3>
              </div>
              <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                {formatProgressCount(visibleProducts.length, activeTab.count)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10">
              {hasMoreProducts ? (
                <button
                  type="button"
                  onClick={() => void handleLoadMore()}
                  disabled={isLoadingMore}
                  className="inline-flex items-center justify-center rounded-full border border-slate-900 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:cursor-wait disabled:opacity-70 sm:px-8"
                >
                  {isLoadingMore ? 'Loading More...' : 'Load More Products'}
                </button>
              ) : null}

              <Link
                href="/shop"
                className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.18em] text-[var(--brand-navy)]"
              >
                View all products
                <ArrowRight size={15} className="ml-2" />
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
