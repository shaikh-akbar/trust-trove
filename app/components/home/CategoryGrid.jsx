import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProducts } from '../../../lib/product';
import { buildCategorySummary } from '../store/StorefrontPages';

const CARD_STYLES = [
  'bg-[linear-gradient(145deg,#0f172a_0%,#1e293b_100%)] text-white',
  'bg-[linear-gradient(145deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-950',
  'bg-[linear-gradient(145deg,#fff7ed_0%,#fde68a_100%)] text-slate-950',
  'bg-[linear-gradient(145deg,#ecfeff_0%,#bfdbfe_100%)] text-slate-950',
];

export default async function CategoryGrid() {
  const products = await getProducts();
  const categories = buildCategorySummary(products).slice(0, 4);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Shop by Category</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Jump straight into the collections people usually browse first.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:text-slate-600"
          >
            View All <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => {
            const cardStyle = CARD_STYLES[index % CARD_STYLES.length];
            const countLabel = `${String(category.count).padStart(2, '0')} products`;

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={`group relative overflow-hidden rounded-[2rem] border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${cardStyle}`}
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex min-h-[220px] flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] opacity-70">{countLabel}</p>
                    <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                      {category.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 opacity-75">
                      Browse this collection with a cleaner focused layout and faster entry into related products.
                    </p>
                  </div>

                  <span className="inline-flex items-center text-sm font-black uppercase tracking-[0.2em]">
                    Explore <ArrowRight size={16} className="ml-2 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
