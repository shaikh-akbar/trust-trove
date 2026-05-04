import Link from 'next/link';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

const heroStats = [
  { label: 'Curated categories', value: '06+' },
  { label: 'Fast dispatch', value: '24-48h' },
  { label: 'Trusted picks', value: 'Daily' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_55%,#ffffff_100%)]">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.28),transparent_68%)]" />
      <div className="absolute left-[-4rem] top-10 h-40 w-40 rounded-full bg-amber-100/50 blur-3xl" />
      <div className="absolute right-[-3rem] top-12 h-44 w-44 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-700 shadow-sm backdrop-blur">
            <Zap size={14} className="fill-current text-amber-500" />
            New Collection Live
          </div>

          <h1 className="mt-5 font-display text-3xl font-semibold leading-[0.96] tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            Curated Finds
            <span className="block text-slate-400">For Everyday Living.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Premium products across fashion, home, electronics, wellness, and more. A cleaner storefront, faster discovery, and trusted value in one place.
          </p>

          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="#shop-section"
              className="inline-flex h-13 items-center justify-center rounded-full bg-slate-950 px-7 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
            >
              Start Shopping <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              href="/categories"
              className="inline-flex h-13 items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-sm font-black uppercase tracking-[0.18em] text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View Collections
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-slate-200 bg-white/85 px-4 py-4 shadow-sm backdrop-blur"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="rounded-full bg-slate-100 p-2 text-slate-700">
                    <Sparkles size={14} />
                  </span>
                  <p className="text-2xl font-black tracking-tight text-slate-950">{item.value}</p>
                </div>
                <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
