"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import ProductCard from "../home/ProductCard";
import { buildFilterOptions, filterProducts } from "../../../lib/storefront";

function FilterSection({ title, children }) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-[0_24px_80px_-48px_rgba(8,15,43,0.45)]">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.24em] text-[var(--brand-navy)]">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function FilterOption({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-700 transition hover:border-[var(--line)]">
      <span className="font-medium">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--brand-gold)]" />
    </label>
  );
}

export default function CatalogExperienceClient({
  products,
  categories = [],
  initialQuery = "",
  activeCategorySlug = "",
  activeCategoryTitle = "",
  basePath = "/shop",
  eyebrow,
  title,
  description,
  spotlight,
  emptyTitle,
  emptyText,
  heroBackgroundImage,
  heroMobileBackgroundImage,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
}) {
  const catalogProducts = useMemo(() => products || [], [products]);
  const filterOptions = useMemo(() => buildFilterOptions(catalogProducts), [catalogProducts]);
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [categorySearch, setCategorySearch] = useState("");
  const [minPrice, setMinPrice] = useState(filterOptions.minPrice);
  const [maxPrice, setMaxPrice] = useState(filterOptions.maxPrice);
  const [showFilters, setShowFilters] = useState(false);
  const hasHeroCopy = Boolean(eyebrow || title || description || spotlight);
  const hasServerPagination = totalPages > 1;
  const hasServerScopedCategory =
    Boolean(activeCategoryTitle) && basePath.startsWith("/categories/");

  useEffect(() => {
    setSelectedCategories([]);
  }, [activeCategoryTitle, basePath]);

  function toggleValue(setter, value) {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function buildPageHref({
    page = 1,
    categorySlug = activeCategorySlug || "",
    queryValue = initialQuery,
  } = {}) {
    const params = new URLSearchParams();

    if (page > 1) {
      params.set("page", String(page));
    }

    if (categorySlug) {
      params.set("category", categorySlug);
    }

    if (queryValue) {
      params.set("q", queryValue);
    }

    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  }

  function renderPaginationControls() {
    if (!(totalPages > 1 && !hasInteractiveFilters)) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href={
            currentPage > 1
              ? buildPageHref({
                  page: currentPage - 1,
                  categorySlug: activeCategorySlug,
                  queryValue: initialQuery,
                })
              : "#"
          }
          aria-disabled={currentPage <= 1}
          className={`inline-flex rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${
            currentPage > 1
              ? "border-[var(--line)] bg-white text-[var(--brand-navy)]"
              : "pointer-events-none border-[var(--line)] bg-[var(--surface-soft)] text-slate-400"
          }`}
        >
          Prev
        </Link>
        <span className="text-[11px] font-semibold text-slate-500">
          {currentPage}/{totalPages}
        </span>
        <Link
          href={
            currentPage < totalPages
              ? buildPageHref({
                  page: currentPage + 1,
                  categorySlug: activeCategorySlug,
                  queryValue: initialQuery,
                })
              : "#"
          }
          aria-disabled={currentPage >= totalPages}
          className={`inline-flex rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${
            currentPage < totalPages
              ? "border-[var(--line)] bg-white text-[var(--brand-navy)]"
              : "pointer-events-none border-[var(--line)] bg-[var(--surface-soft)] text-slate-400"
          }`}
        >
          Next
        </Link>
      </div>
    );
  }

  const filteredProducts = useMemo(() => {
    const nextProducts = filterProducts(catalogProducts, {
      query: deferredQuery,
      minPrice,
      maxPrice,
      categories: hasServerScopedCategory ? [] : selectedCategories,
      colors: selectedColors,
      sizes: selectedSizes,
    });

    if (sortBy === "price-low") {
      return [...nextProducts].sort((left, right) => Number(left.price_selling || 0) - Number(right.price_selling || 0));
    }

    if (sortBy === "price-high") {
      return [...nextProducts].sort((left, right) => Number(right.price_selling || 0) - Number(left.price_selling || 0));
    }

    if (sortBy === "name") {
      return [...nextProducts].sort((left, right) => String(left.title || "").localeCompare(String(right.title || "")));
    }

    return nextProducts;
  }, [catalogProducts, deferredQuery, hasServerScopedCategory, maxPrice, minPrice, selectedCategories, selectedColors, selectedSizes, sortBy]);

  const allCategoryLabels = useMemo(() => {
    const summaryTitles = (categories || [])
      .filter((category) => Number(category?.count || 0) > 0)
      .map((category) => ({
        slug: String(category?.slug || "").trim(),
        title: String(category?.title || "").trim(),
      }))
      .filter((category) => category.slug && category.title);

    if (summaryTitles.length > 0) {
      return Array.from(
        new Map(summaryTitles.map((category) => [category.slug, category])).values()
      ).sort((left, right) =>
        left.title.localeCompare(right.title)
      );
    }

    return filterOptions.categories.map((title) => ({
      slug: title
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      title,
    }));
  }, [categories, filterOptions.categories]);
  const filteredCategoryLabels = useMemo(() => {
    const normalizedQuery = categorySearch.trim().toLowerCase();

    if (!normalizedQuery) {
      return allCategoryLabels;
    }

    return allCategoryLabels.filter((category) =>
      category.title.toLowerCase().includes(normalizedQuery)
    );
  }, [allCategoryLabels, categorySearch]);

  const activeFilterCount =
    (hasServerScopedCategory ? 0 : selectedCategories.length) +
    selectedColors.length +
    selectedSizes.length +
    (deferredQuery ? 1 : 0);
  const visibleProducts = filteredProducts;
  const hasInteractiveFilters =
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    minPrice !== filterOptions.minPrice ||
    maxPrice !== filterOptions.maxPrice ||
    Boolean(deferredQuery);
  const resultHeadlineCount =
    hasServerPagination && !hasInteractiveFilters
      ? Number(totalCount || filteredProducts.length)
      : filteredProducts.length;
  const visibleCategoryBadges = hasServerScopedCategory
    ? [activeCategoryTitle].filter(Boolean)
    : selectedCategories;

  return (
    <div className="bg-[var(--surface-soft)] pb-16">
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--brand-navy)] text-white">
        {heroBackgroundImage ? (
          <picture className="absolute inset-0">
            {heroMobileBackgroundImage ? (
              <source media="(max-width: 639px)" srcSet={heroMobileBackgroundImage} />
            ) : null}
            <img
              src={heroBackgroundImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        ) : null}
        <div
          className={`absolute inset-0 ${
            heroBackgroundImage
              ? "bg-[linear-gradient(90deg,rgba(20,29,96,0.9)_0%,rgba(20,29,96,0.78)_42%,rgba(20,29,96,0.68)_100%)]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_34%)]"
          }`}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.08))]" />
        <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${hasHeroCopy ? "py-12 lg:py-16" : "py-24 sm:py-32 lg:py-40"}`}>
          {hasHeroCopy ? (
            <>
              {eyebrow ? (
                <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-slate-200">{eyebrow}</p>
              ) : null}
              <div className={`grid gap-6 ${spotlight ? "mt-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end" : "mt-0"}`}>
                <div>
                  {title ? (
                    <h1 className="font-display text-3xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-4xl">{title}</h1>
                  ) : null}
                  {description ? (
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">{description}</p>
                  ) : null}
                </div>
                {spotlight ? (
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
                    <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-300">Spotlight</p>
                    <h2 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                      {spotlight.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-200">{spotlight.text}</p>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      {spotlight.points.map((point) => (
                        <span
                          key={point}
                          className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.08] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-100"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {showFilters ? (
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            />
          ) : null}

          <aside
            className={`space-y-5 ${
              showFilters
                ? "fixed inset-x-3 top-4 bottom-24 z-50 overflow-y-auto rounded-[2rem] bg-[var(--surface-soft)] p-4 shadow-[0_32px_90px_-45px_rgba(8,15,43,0.52)] sm:inset-x-6 sm:bottom-6 sm:top-6"
                : "hidden"
            } lg:static lg:block lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none`}
          >
            <div className="flex items-start justify-between rounded-[1.75rem] border border-[var(--line)] bg-[var(--brand-navy)] px-5 py-4 text-white lg:hidden">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-200">
                  Filter products
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Narrow the catalog faster on mobile by category, price, color, and size.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="ml-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {activeFilterCount > 0 ? (
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4 lg:hidden">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Active filters
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand-navy)]"
                    >
                      {category}
                    </span>
                  ))}
                  {selectedColors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand-navy)]"
                    >
                      {color}
                    </span>
                  ))}
                  {selectedSizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand-navy)]"
                    >
                      {size}
                    </span>
                  ))}
                  {deferredQuery ? (
                    <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand-navy)]">
                      {deferredQuery}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <FilterSection title="Search">
              <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-3">
                <Search size={18} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                  placeholder="Search products, materials, styles..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </FilterSection>

            <FilterSection title="Price Range">
              <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Rs. {minPrice}</span>
                  <span>Rs. {maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={filterOptions.minPrice}
                  max={filterOptions.maxPrice}
                  value={minPrice}
                  onChange={(event) => {
                    setMinPrice(Math.min(Number(event.target.value), maxPrice));
                  }}
                  className="mt-4 w-full accent-[var(--brand-navy)]"
                />
                <input
                  type="range"
                  min={filterOptions.minPrice}
                  max={filterOptions.maxPrice}
                  value={maxPrice}
                  onChange={(event) => {
                    setMaxPrice(Math.max(Number(event.target.value), minPrice));
                  }}
                  className="mt-3 w-full accent-[var(--brand-navy)]"
                />
              </div>
            </FilterSection>

            {allCategoryLabels.length > 0 ? (
              <FilterSection title="Categories">
                <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-3">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder="Search categories..."
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
                {filteredCategoryLabels.length > 0 ? (
                  <div className="max-h-[16.5rem] space-y-3 overflow-y-auto pr-1 lg:max-h-[22rem]">
                    {filteredCategoryLabels.map((category) => (
                      <Link
                        key={category.slug}
                        href={
                          activeCategorySlug === category.slug
                            ? buildPageHref({ page: 1, categorySlug: "", queryValue: initialQuery })
                            : buildPageHref({
                                page: 1,
                                categorySlug: category.slug,
                                queryValue: initialQuery,
                              })
                        }
                        onClick={() => setShowFilters(false)}
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                          activeCategorySlug === category.slug
                            ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                            : "border-[var(--line-soft)] bg-[var(--surface-soft)] text-slate-700 hover:border-[var(--line)]"
                        }`}
                      >
                        <span className="font-medium">{category.title}</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]">
                          {activeCategorySlug === category.slug ? "Active" : "Open"}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-4 py-5 text-sm text-slate-500">
                    No categories matched your search.
                  </div>
                )}
              </FilterSection>
            ) : null}

            {filterOptions.colors.length > 0 ? (
              <FilterSection title="Colors">
                {filterOptions.colors.map((color) => (
                  <FilterOption
                    key={color}
                    label={color}
                    checked={selectedColors.includes(color)}
                    onChange={() => toggleValue(setSelectedColors, color)}
                  />
                ))}
              </FilterSection>
            ) : null}

            {filterOptions.sizes.length > 0 ? (
              <FilterSection title="Sizes">
                {filterOptions.sizes.map((size) => (
                  <FilterOption
                    key={size}
                    label={size}
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleValue(setSelectedSizes, size)}
                  />
                ))}
              </FilterSection>
            ) : null}

            <div className="sticky bottom-0 flex gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-3 shadow-[0_18px_48px_-32px_rgba(8,15,43,0.3)] lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategorySearch("");
                  setSelectedCategories([]);
                  setSelectedColors([]);
                  setSelectedSizes([]);
                  setMinPrice(filterOptions.minPrice);
                  setMaxPrice(filterOptions.maxPrice);
                }}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-navy)]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--brand-navy)] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-white"
              >
                View {filteredProducts.length}
              </button>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-400">Live catalog</p>
                  <h2 className="mt-2 font-display text-xl font-semibold text-[var(--brand-navy)] sm:text-2xl">
                    {resultHeadlineCount} {hasServerPagination && !hasInteractiveFilters ? "products" : "refined result"}
                    {resultHeadlineCount === 1 ? "" : "s"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {hasServerPagination && !hasInteractiveFilters
                      ? "Browse this category through paginated in-stock products. Use filters only when you want to narrow the current view."
                      : "Search, sort, and filter by category, color, size, and price without leaving the page."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setShowFilters((current) => !current)}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-bold text-[var(--brand-navy)] lg:hidden"
                  >
                    <SlidersHorizontal size={16} className="mr-2" />
                    Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </button>

                  <select
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value);
                    }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name</option>
                  </select>
                  {renderPaginationControls()}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedCategories([]);
                      setSelectedColors([]);
                      setSelectedSizes([]);
                      setMinPrice(filterOptions.minPrice);
                      setMaxPrice(filterOptions.maxPrice);
                    }}
                    className="inline-flex items-center rounded-full bg-[var(--brand-navy)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white"
                  >
                    Reset all <X size={14} className="ml-2" />
                  </button>
                ) : null}

                {deferredQuery ? (
                  <span className="inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-600">
                    Search: {deferredQuery}
                  </span>
                ) : null}

                {visibleCategoryBadges.map((category) => (
                  <span
                    key={category}
                    className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-600"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} compact />
                  ))}
                </div>

              </>
            ) : (
              <div className="rounded-[2rem] border border-[var(--line)] bg-white px-6 py-16 text-center shadow-[0_30px_90px_-58px_rgba(8,15,43,0.45)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-navy)] text-[var(--surface-cream)]">
                  <Sparkles size={20} />
                </div>
                <h3 className="mt-6 font-display text-3xl font-semibold text-[var(--brand-navy)]">{emptyTitle}</h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">{emptyText}</p>
                <Link
                  href="/shop"
                  className="mt-8 inline-flex rounded-full bg-[var(--brand-gold)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--brand-navy)]"
                >
                  Explore full catalog
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
