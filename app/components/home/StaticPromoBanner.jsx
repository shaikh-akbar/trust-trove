"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const AUTO_PLAY_MS = 4500;

const CAROUSEL_SLIDES = [
  {
    id: "health-beauty",
    eyebrow: "Tech Trends",
    title: "Health & Beauty",
    description: "Skincare, wellness, and fitness essentials",
    href: "/shop",
    image: "/banner/health.png",
    imageClassName: "object-[72%_center] sm:object-center",
  },
  {
   
     id: "electronics",
    eyebrow: "Electronics",
    title: "Electronics",
    description: "Smart gadgets for every day",
    href: "/shop",
    image: "/banner/electronics.png",
    imageClassName: "object-[64%_center] sm:object-center",
  },
  {
    id: "Home Decor",
    eyebrow: "Home Decor",
    title: "Home Decor",
    description: "Easy upgrades for every room",
    href: "/shop",
    image: "/banner/home-decor.png",
    imageClassName: "object-[58%_center] sm:object-center",
  },
];

const SIDE_TILES = [
  {
    id: "Face Serum",
    badge: "25% Off",
    title: "Health & Beauty",
    description: "Polished carry picks",
    href: "https://gomodexa.com/product/brightening-vitamin-c-gel-face-wash-1-pc-100ml-20325",
    image: "/banner/ban-4.webp",
    imagePosition: "center center",
  },
  {
    id: "Home Decor",
    badge: "45% Off",
    title: "Pillow",
    description: "Classic statement styles",
    href: "https://gomodexa.com/product/pillow-covers-cushion-cases-soft-leather-and-cotton-23-22-inch-1-pair-2-pc-2969",
    image:
      "/banner/ban-5.png",
    imagePosition: "center center",
  },
  {
    id: "Stand",
    eyebrow: "Mobile Stand",
    title: "Mobile Stand",
    description: "Min. 40-80% Off",
    href: "/",
    image:
      "/banner/ban-6.png",
    imagePosition: "78% center",
    className: "col-span-2",
  },
];

function SideTile({ tile }) {
  return (
    <Link
      href={tile.href}
      className={`group relative overflow-hidden rounded-[1.6rem] border border-white/80 bg-slate-200 shadow-[0_22px_50px_-40px_rgba(15,23,42,0.32)] ${tile.className || ""}`}
    >
      <img
        src={tile.image}
        alt={tile.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        style={{ objectPosition: tile.imagePosition || "center center" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.38)_100%)]" />

      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div>
          {tile.badge ? (
            <span className="inline-flex rounded-full bg-[#3574d4] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white">
              {tile.badge}
            </span>
          ) : null}
          {tile.eyebrow ? (
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#3574d4]">{tile.eyebrow}</p>
          ) : null}
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-white">
            {tile.title}
          </h3>
          <p className="mt-1 text-xs text-white/88">{tile.description}</p>
        </div>

        {/* <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-900">
          Shop Now
        </span> */}
      </div>
    </Link>
  );
}

export default function StaticPromoBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % CAROUSEL_SLIDES.length);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeSlide = CAROUSEL_SLIDES[activeIndex];

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % CAROUSEL_SLIDES.length);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="grid gap-3 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-slate-200 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.35)] lg:h-[15.5rem]">
          {CAROUSEL_SLIDES.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                index === activeIndex ? "scale-100 opacity-100" : "scale-105 opacity-0"
              } ${slide.imageClassName || "object-center"}`}
            />
          ))}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.46)_100%)]" />

          <div className="relative flex min-h-[26rem] flex-col justify-between p-5 sm:min-h-[29rem] sm:p-7 lg:h-full lg:min-h-0 lg:p-4">
            <div className="max-w-[13rem] rounded-[1.4rem] bg-white/18 p-4 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.28)] backdrop-blur sm:max-w-[16rem] sm:p-5 lg:max-w-[14rem] lg:p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3574d4] sm:text-[10px]">
                {activeSlide.eyebrow}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.05em] text-white sm:text-[2.5rem] lg:text-[1.9rem]">
                {activeSlide.title}
              </h2>
              <p className="mt-2 text-sm font-medium text-white/88 sm:text-base lg:text-[12px]">{activeSlide.description}</p>
              <Link
                href={activeSlide.href}
                className="mt-4 inline-flex rounded-full border border-slate-900/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-900 lg:px-3 lg:py-1.5"
              >
                Shop Now
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 rounded-full bg-white/8 px-2 py-1 backdrop-blur-sm">
                {CAROUSEL_SLIDES.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to ${slide.title}`}
                    className={`rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "h-2.5 w-7 bg-[#355fe6] shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
                        : "h-2 w-2 bg-white/70 hover:bg-white/90"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Previous slide"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[var(--brand-navy)] shadow-[0_8px_24px_-16px_rgba(15,23,42,0.28)] lg:h-8 lg:w-8"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Next slide"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[var(--brand-navy)] shadow-[0_8px_24px_-16px_rgba(15,23,42,0.28)] lg:h-8 lg:w-8"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden grid-cols-2 gap-3 lg:grid lg:h-[15.5rem]">
          {SIDE_TILES.map((tile) => (
            <SideTile key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}
