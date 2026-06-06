"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, PackageCheck, Save, Search, Sparkles, X } from "lucide-react";
import { generateProductSeoDraft } from "../../../lib/product-seo-drafts";
import { hasIndexableProductPageSignals } from "../../../lib/seo";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatPrice(value) {
  return `Rs. ${Number(value || 0)}`;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function getSeoKeywordCount(value) {
  return normalizeText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function getInventoryCount(product) {
  if (Array.isArray(product?.variants) && product.variants.length > 0) {
    return product.variants.reduce(
      (sum, variant) => sum + Number(variant?.inventory_quantity || 0),
      0
    );
  }

  if (product?.primary_variant) {
    return Number(product.primary_variant.inventory_quantity || 0);
  }

  return Number(product?.inventory_quantity || 0);
}

function buildSeoQualityReport(product) {
  const shortDescriptionLength = normalizeText(product?.short_description).length;
  const seoTitleLength = normalizeText(product?.seo_title).length;
  const seoDescriptionLength = normalizeText(product?.seo_description).length;
  const keywordCount = getSeoKeywordCount(product?.seo_keywords);
  const inventoryCount = getInventoryCount(product);
  const imagePresent = Boolean(product?.image || product?.main_image || product?.image_url);
  const isIndexable = hasIndexableProductPageSignals({
    ...product,
    title: product?.title || "",
    main_image: product?.image || product?.main_image || product?.image_url || "",
    inventory_quantity: inventoryCount,
    variants:
      Array.isArray(product?.variants) && product.variants.length > 0
        ? product.variants
        : [{ inventory_quantity: inventoryCount }],
  });

  const checks = [
    {
      label: "Product title",
      passed: normalizeText(product?.title).length >= 20,
      detail: normalizeText(product?.title).length >= 20 ? "Looks usable" : "Needs a clearer search-facing title",
      weight: 10,
    },
    {
      label: "Clean slug",
      passed: normalizeText(product?.slug).length >= 8,
      detail: normalizeText(product?.slug).length >= 8 ? "Slug is present" : "Add a meaningful slug",
      weight: 10,
    },
    {
      label: "Category or brand",
      passed: Boolean(normalizeText(product?.category) || normalizeText(product?.brand)),
      detail:
        normalizeText(product?.category) || normalizeText(product?.brand)
          ? "Taxonomy is present"
          : "Add category or brand context",
      weight: 10,
    },
    {
      label: "Product image",
      passed: imagePresent,
      detail: imagePresent ? "Image is available" : "Add a product image",
      weight: 10,
    },
    {
      label: "Inventory",
      passed: inventoryCount > 0,
      detail: inventoryCount > 0 ? `In stock: ${inventoryCount}` : "Out of stock pages are weaker for indexing",
      weight: 10,
    },
    {
      label: "Short description",
      passed: shortDescriptionLength >= 140,
      detail:
        shortDescriptionLength >= 140
          ? `${shortDescriptionLength} characters`
          : `Only ${shortDescriptionLength} characters, aim for 140+`,
      weight: 20,
    },
    {
      label: "SEO title",
      passed: seoTitleLength >= 30 && seoTitleLength <= 65,
      detail:
        seoTitleLength >= 30 && seoTitleLength <= 65
          ? `${seoTitleLength} characters`
          : `${seoTitleLength} characters, aim for 30-65`,
      weight: 10,
    },
    {
      label: "SEO description",
      passed: seoDescriptionLength >= 120 && seoDescriptionLength <= 160,
      detail:
        seoDescriptionLength >= 120 && seoDescriptionLength <= 160
          ? `${seoDescriptionLength} characters`
          : `${seoDescriptionLength} characters, aim for 120-160`,
      weight: 10,
    },
    {
      label: "SEO keywords",
      passed: keywordCount >= 5,
      detail: keywordCount >= 5 ? `${keywordCount} keywords` : `${keywordCount} keywords, aim for 5+`,
      weight: 10,
    },
  ];

  const score = checks.reduce(
    (sum, check) => sum + (check.passed ? check.weight : 0),
    0
  );

  const tone =
    score >= 85 ? "strong" : score >= 60 ? "improving" : "weak";

  return { checks, score, tone, isIndexable };
}

function buildEmptyMessages(query, filter) {
  if (query.trim()) {
    return "No product matched your search.";
  }

  if (filter === "featured") {
    return "No featured products selected yet.";
  }

  if (filter === "inactive") {
    return "No inactive products found.";
  }

  return "No products available right now.";
}

export default function AdminProductsClient({
  initialData,
  initialQuery = "",
  initialFilter = "all",
  initialCategory = "all",
  statusOptions = [],
}) {
  const [products, setProducts] = useState(initialData?.items || []);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [categories, setCategories] = useState(initialData?.categories || []);
  const [currentPage, setCurrentPage] = useState(Number(initialData?.page || 1));
  const [totalPages, setTotalPages] = useState(Number(initialData?.totalPages || 1));
  const [totalProducts, setTotalProducts] = useState(Number(initialData?.total || 0));
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const deferredQuery = useDeferredValue(query);
  const selectedProduct =
    products.find((product) => product.id === selectedId) ||
    products[0] ||
    null;
  const seoReport = draft ? buildSeoQualityReport(draft) : null;

  useEffect(() => {
    let isCancelled = false;

    async function loadProducts() {
      setIsLoadingProducts(true);

      try {
        const searchParams = new URLSearchParams({
          page: String(currentPage),
          q: deferredQuery.trim(),
          status: filter,
          category: categoryFilter,
        });
        const response = await fetch(`/api/admin/products?${searchParams.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load products.");
        }

        if (isCancelled) {
          return;
        }

        setProducts(payload.items || []);
        setCategories(payload.categories || []);
        setTotalProducts(Number(payload.total || 0));
        setTotalPages(Number(payload.totalPages || 1));
      } catch (error) {
        if (!isCancelled) {
          setFormMessage(error.message || "Unable to load products.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, deferredQuery, filter, categoryFilter]);

  useEffect(() => {
    if (!draft) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape" && !isSaving) {
        setDraft(null);
        setFormMessage("");
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [draft, isSaving]);

  function openProduct(product) {
    setSelectedId(product.id);
    setDraft(product);
    setFormMessage("");
  }

  function closeEditor() {
    if (isSaving) {
      return;
    }

    setDraft(null);
    setFormMessage("");
  }

  function updateDraft(key, value) {
    setDraft((current) => ({
      ...(current || {}),
      [key]: value,
    }));
  }

  function updatePrimaryVariantInventory(value) {
    const numeric = Number(value || 0);
    setDraft((current) => ({
      ...(current || {}),
      primary_variant: {
        ...(current?.primary_variant || {}),
        inventory_quantity: numeric,
      },
    }));
  }

  function handleGenerateSeoDraft() {
    if (!draft) {
      return;
    }

    const generatedDraft = generateProductSeoDraft(draft);

    setDraft((current) => ({
      ...(current || {}),
      category: generatedDraft.category,
      brand: generatedDraft.brand,
      short_description: generatedDraft.short_description,
      seo_title: generatedDraft.seo_title,
      seo_description: generatedDraft.seo_description,
      seo_keywords: generatedDraft.seo_keywords,
    }));
    setFormMessage("SEO draft generated. Review the fields and save when ready.");
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!draft?.id) {
      return;
    }

    setIsSaving(true);
    setFormMessage("");

    try {
      const response = await fetch(`/api/admin/products/${draft.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draft.title,
          slug: draft.slug,
          status: draft.status,
          is_featured: draft.is_featured,
          new_arrivals: draft.new_arrivals,
          short_description: draft.short_description,
          seo_title: draft.seo_title,
          seo_description: draft.seo_description,
          seo_keywords: draft.seo_keywords,
          brand: draft.brand,
          category: draft.category,
          supplier_name: draft.supplier_name,
          supplier_product_code: draft.supplier_product_code,
          inventory_quantity: draft.primary_variant?.inventory_quantity,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save product.");
      }

      const updatedProduct = payload.product;
      setProducts((current) =>
        current.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
      );
      setSelectedId(updatedProduct.id);
      setDraft(updatedProduct);
      setFormMessage("Product updated successfully.");
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
    <div className="space-y-4">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Catalog control</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                Manage homepage featured products and product SEO
              </h3>
            </div>

            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Matching products</p>
              <p className="mt-1 text-xl font-black tracking-tight text-[var(--brand-navy)]">{totalProducts}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search title, slug, SKU, supplier code..."
                className="w-full rounded-full border border-[var(--line)] bg-[var(--surface-soft)] py-3 pl-11 pr-11 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear product search"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>

            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setCurrentPage(1);
                setFormMessage("");
              }}
              className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)]"
            >
              <option value="all">All products</option>
              <option value="featured">Featured only</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
                setFormMessage("");
              }}
              className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)]"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {products.length > 0 ? (
            products.map((product) => {
              const isActiveCard = product.id === (draft?.id || selectedProduct?.id);
              const productSeoReport = buildSeoQualityReport(product);

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openProduct(product)}
                  className={`text-left rounded-[1.8rem] border p-4 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)] transition ${
                    isActiveCard
                      ? "border-[var(--brand-navy)] bg-[linear-gradient(135deg,#ffffff_0%,#eef2ff_100%)]"
                      : "border-[var(--line)] bg-white hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-soft)]">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={80}
                          height={80}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--brand-navy)]">
                          <PackageCheck size={18} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : product.status === "inactive"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700"
                        }`}>
                          {product.status}
                        </span>
                        {product.is_featured ? (
                          <span className="rounded-full bg-[var(--brand-navy)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                            Featured
                          </span>
                        ) : null}
                        {product.new_arrivals ? (
                          <span className="rounded-full bg-[#2563eb] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                            New Arrival
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-lg font-black tracking-tight text-slate-950">
                        {product.title}
                      </h3>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                        /product/{product.slug || product.id}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
                          SEO {productSeoReport.score}/100
                        </span>
                        {productSeoReport.isIndexable ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                            Index-ready
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                            Needs work
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</p>
                          <p className="mt-1 truncate font-semibold text-slate-700">{product.category || "Uncategorized"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Vendor</p>
                          <p className="mt-1 truncate font-semibold text-slate-700">{product.vendor || "GoModexa"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">SKU</p>
                          <p className="mt-1 truncate font-semibold text-slate-700">{product.primary_variant?.sku || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Price</p>
                          <p className="mt-1 font-semibold text-slate-700">{formatPrice(product.primary_variant?.price_selling || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="md:col-span-2 rounded-[2rem] border border-dashed border-[var(--line)] bg-white px-6 py-14 text-center">
              <p className="text-lg font-black text-slate-900">
                {isLoadingProducts ? "Loading products..." : buildEmptyMessages(query, filter)}
              </p>
              <p className="mt-2 text-sm text-slate-500">Try another search term or switch the current filter.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-[1.6rem] border border-[var(--line)] bg-white px-4 py-4 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Page {currentPage} of {Math.max(1, totalPages)}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Showing up to 100 products per page with overall search and category filters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage <= 1 || isLoadingProducts}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages || isLoadingProducts}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {draft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 sm:px-6">
          <div
            className="absolute inset-0"
            onClick={closeEditor}
            aria-hidden="true"
          />
          <section className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_32px_100px_-40px_rgba(15,23,42,0.5)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Product editor</p>
                <h3 className="mt-2 line-clamp-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                  {draft.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Update homepage featured state, status, and SEO copy from one place.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {draft.is_featured ? (
                  <span className="hidden items-center gap-2 rounded-full bg-[var(--brand-navy)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white sm:inline-flex">
                    <Sparkles size={12} />
                    Featured
                  </span>
                ) : null}
                {draft.new_arrivals ? (
                  <span className="hidden items-center gap-2 rounded-full bg-[#2563eb] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white sm:inline-flex">
                    <Sparkles size={12} />
                    New Arrival
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={isSaving}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Close product editor"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Currently editing
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {draft.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    /product/{draft.slug || draft.id}
                  </p>
                </div>

                {seoReport ? (
                  <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          SEO Quality Score
                        </p>
                        <h4 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                          {seoReport.score}/100
                        </h4>
                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          {seoReport.tone === "strong"
                            ? "Strong indexing signals for this product."
                            : seoReport.tone === "improving"
                              ? "Decent foundation, but a few SEO fields still need tightening."
                              : "This product is still thin for search and should be improved before relying on it for indexing."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${
                          seoReport.isIndexable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {seoReport.isIndexable ? "Likely indexable" : "Currently weak for indexing"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
                          {seoReport.checks.filter((check) => check.passed).length}/{seoReport.checks.length} checks passed
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {seoReport.checks.map((check) => (
                        <div
                          key={check.label}
                          className={`rounded-[1.1rem] border px-4 py-3 ${
                            check.passed
                              ? "border-emerald-200 bg-emerald-50/70"
                              : "border-amber-200 bg-amber-50/70"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">
                              {check.label}
                            </p>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                              check.passed
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {check.passed ? "Pass" : "Fix"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-600">
                            {check.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Title</span>
                    <input
                      type="text"
                      value={draft.title || ""}
                      onChange={(event) => updateDraft("title", event.target.value)}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Slug</span>
                    <input
                      type="text"
                      value={draft.slug || ""}
                      onChange={(event) => updateDraft("slug", event.target.value)}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</span>
                    <select
                      value={draft.status || "active"}
                      onChange={(event) => updateDraft("status", event.target.value)}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</span>
                    <input
                      type="text"
                      value={draft.category || ""}
                      onChange={(event) => updateDraft("category", event.target.value)}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Brand</span>
                    <input
                      type="text"
                      value={draft.brand || ""}
                      onChange={(event) => updateDraft("brand", event.target.value)}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                    <label className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 sm:col-span-2">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Homepage featured</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-700">Show this product in the featured products section on home.</span>
                      </div>
                    <input
                      type="checkbox"
                      checked={Boolean(draft.is_featured)}
                      onChange={(event) => updateDraft("is_featured", event.target.checked)}
                        className="h-5 w-5 accent-[var(--brand-navy)]"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 sm:col-span-2">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">New arrivals</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-700">Turn this on to include the product on the new arrivals page.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(draft.new_arrivals)}
                        onChange={(event) => updateDraft("new_arrivals", event.target.checked)}
                        className="h-5 w-5 accent-[#2563eb]"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Short description</span>
                    <textarea
                      value={draft.short_description || ""}
                      onChange={(event) => updateDraft("short_description", event.target.value)}
                      rows={4}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SEO title</span>
                    <input
                      type="text"
                      value={draft.seo_title || ""}
                      onChange={(event) => updateDraft("seo_title", event.target.value)}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SEO description</span>
                    <textarea
                      value={draft.seo_description || ""}
                      onChange={(event) => updateDraft("seo_description", event.target.value)}
                      rows={4}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SEO keywords</span>
                    <textarea
                      value={draft.seo_keywords || ""}
                      onChange={(event) => updateDraft("seo_keywords", event.target.value)}
                      rows={3}
                      placeholder="travelling storage bag, travel organizer bag, clothes storage bag"
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier name</span>
                    <input
                      type="text"
                      value={draft.supplier_name || ""}
                      onChange={(event) => updateDraft("supplier_name", event.target.value)}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supplier code</span>
                    <input
                      type="text"
                      value={draft.supplier_product_code || ""}
                      onChange={(event) => updateDraft("supplier_product_code", event.target.value)}
                      className="w-full rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[var(--brand-navy)] focus:bg-white"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Primary SKU</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{draft.primary_variant?.sku || "N/A"}</p>
                              <div className="mt-2 flex items-center gap-3">
                                <p className="text-sm font-semibold text-slate-900">Price {formatPrice(draft.primary_variant?.price_selling || 0)}</p>
                                <label className="ml-auto flex items-center gap-2 text-sm text-slate-500">
                                  <span className="text-[11px]">Stock</span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={Number(draft.primary_variant?.inventory_quantity || 0)}
                                    onChange={(event) => updatePrimaryVariantInventory(event.target.value)}
                                    className="w-20 rounded-[0.6rem] border border-[var(--line)] bg-white px-2 py-1 text-sm font-semibold text-slate-900 outline-none"
                                  />
                                </label>
                              </div>
                  </div>
                  <div className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Last updated</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(draft.updated_at)}</p>
                    <p className="mt-2 text-[11px] text-slate-500">Created {formatDate(draft.created_at)}</p>
                  </div>
                </div>

                {formMessage ? (
                  <div className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold ${
                    formMessage.toLowerCase().includes("success")
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : formMessage.toLowerCase().includes("generated")
                        ? "border border-sky-200 bg-sky-50 text-sky-700"
                      : "border border-rose-200 bg-rose-50 text-rose-700"
                  }`}>
                    {formMessage}
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateSeoDraft}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-navy)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles size={16} />
                    Generate SEO Draft
                  </button>
                  <button
                    type="button"
                    onClick={closeEditor}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-700 transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#313b78] disabled:cursor-wait disabled:opacity-70"
                  >
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

