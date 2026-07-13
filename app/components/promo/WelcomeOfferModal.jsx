"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "trusttrove_welcome_offer_dismissed";
const COUPON_CODE = "GOMODEXA10";

export default function WelcomeOfferModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setOpen(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — code is still visible to copy manually.
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-[3px]">
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_36px_120px_-48px_rgba(15,23,42,0.75)] sm:rounded-[2rem]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#161f66_52%,#334155_100%)] px-6 pb-8 pt-6 text-center text-white">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close welcome offer"
          >
            <X size={16} />
          </button>

          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/75">
            <Sparkles size={13} />
            Welcome
          </div>

          <h2 className="mt-4 font-display text-[1.75rem] font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">
            Get 10% Off
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[13px] leading-6 text-white/72 sm:text-sm">
            Welcome to Gomodexa! Use this code at checkout for 10% off your order.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-7">
          <button
            type="button"
            onClick={copyCode}
            className="flex w-full items-center justify-between rounded-full border border-dashed border-slate-300 bg-slate-50 px-5 py-3.5 text-left transition hover:border-[#161f66] hover:bg-white"
          >
            <span className="text-[15px] font-black tracking-[0.12em] text-slate-950 sm:text-base">
              {COUPON_CODE}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#161f66]">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Code"}
            </span>
          </button>

          <Link
            href="/shop"
            onClick={close}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#161f66] px-6 py-3.5 text-[13px] font-black uppercase tracking-[0.16em] text-white shadow-[0_22px_60px_-32px_rgba(22,31,102,0.8)] transition hover:-translate-y-0.5 hover:bg-[#10184f]"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
