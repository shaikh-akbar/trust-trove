"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const AUTO_PLAY_MS = 5000;
const LEFT_BANNER_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    alt: "Minimal fashion accessories laid out on a soft surface",
    label: "Style Edit",
    accent: "Soft neutrals",
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    alt: "Woman in a premium editorial fashion portrait",
    label: "Fresh Arrivals",
    accent: "New season",
  },
  {
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    alt: "Headphones and lifestyle essentials arranged for a product banner",
    label: "Daily Picks",
    accent: "Gift ready",
  },
];

export default function HeroCarousel({ slides = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section className="border-b border-[var(--line)] bg-[linear-gradient(180deg,#f8f2e8_0%,#fffdfa_52%,#f7f0e6_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-[rgba(255,253,250,0.92)] shadow-[0_34px_110px_-72px_rgba(20,29,96,0.38)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden bg-[#141d60] text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18)_0%,transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.02),rgba(20,29,96,0.28))]" />
              <div className="relative flex h-full flex-col justify-between p-5 sm:p-6 lg:p-7">
                <div className="inline-flex w-fit rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.26em] text-slate-100 backdrop-blur">
                  {activeSlide.eyebrow}
                </div>

                <div className="mt-5 flex-1">
                  <Link
                    href={activeSlide.href}
                    className="group relative block min-h-[24rem] overflow-hidden rounded-[2.2rem] border border-white/12 bg-white/10 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] sm:min-h-[28rem]"
                  >
                    {LEFT_BANNER_IMAGES.map((item, index) => (
                      <img
                        key={item.label}
                        src={item.src}
                        alt={item.alt}
                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                          index === activeIndex % LEFT_BANNER_IMAGES.length
                            ? "scale-100 opacity-100"
                            : "scale-105 opacity-0"
                        }`}
                      />
                    ))}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,13,45,0.06)_0%,rgba(8,13,45,0.68)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/72">
                        {LEFT_BANNER_IMAGES[activeIndex % LEFT_BANNER_IMAGES.length].label}
                      </p>
                      <h2 className="mt-3 max-w-md font-display text-4xl font-semibold text-white sm:text-[2.9rem]">
                        {activeSlide.headline}
                      </h2>
                      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-100/90 sm:text-base">
                        {activeSlide.subtext}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={activeSlide.href}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--brand-gold)] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-[#dec08d]"
                  >
                    Explore Deal <ArrowRight size={16} className="ml-2" />
                  </Link>

                  {slides.length > 1 ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goToPrevious}
                        aria-label="Previous slide"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/16"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={goToNext}
                        aria-label="Next slide"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white transition hover:bg-white/16"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,#fffdfa_0%,#f7f0e6_100%)] p-4 sm:p-5 lg:p-6">
              <div className="grid gap-4">
                <Link
                  href={activeSlide.href}
                  className="group overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_70px_-50px_rgba(20,29,96,0.25)]"
                >
                  <div className="relative bg-slate-100">
                    {activeSlide.image ? (
                      <img
                        src={activeSlide.image}
                        alt={activeSlide.title}
                        className="aspect-[4/3.1] w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-[4/3.1] items-center justify-center text-sm font-bold text-slate-400">
                        No banner image
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.7))] p-5 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-200">
                          {activeSlide.category}
                        </p>
                        <h3 className="mt-2 font-display text-3xl font-semibold text-white">
                          {activeSlide.title}
                        </h3>
                    </div>
                  </div>
                </Link>

                {slides.length > 1 ? (
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {slides.map((slide, index) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`group rounded-[1.35rem] border p-3 text-left transition ${
                            index === activeIndex
                            ? "border-[#141d60] bg-[#141d60] text-white shadow-[0_20px_50px_-32px_rgba(20,29,96,0.6)]"
                            : "border-[var(--line)] bg-white text-slate-900 hover:border-[#141d60]/30 hover:bg-[#fbf6ee]"
                          }`}
                        >
                        <p
                          className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                            index === activeIndex ? "text-slate-200" : "text-slate-400"
                          }`}
                        >
                          0{index + 1}
                        </p>
                        <h4
                          className={`mt-2 line-clamp-2 font-display text-lg font-semibold leading-tight tracking-[-0.02em] ${
                            index === activeIndex ? "text-white" : "text-slate-950"
                          }`}
                        >
                          {slide.title}
                        </h4>
                        <p
                          className={`mt-2 text-xs leading-5 ${
                            index === activeIndex ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {slide.offer}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
