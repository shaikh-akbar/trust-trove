"use client";

import { useState } from "react";
import Link from "next/link";

const RATINGS = [1, 2, 3, 4, 5];

export default function CustomerReviewFormClient({ user }) {
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/customer-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          headline,
          reviewText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to save your review.");
      }

      setMessage("Your review has been saved and will be shown in the customer voices section.");
      setHeadline("");
      setReviewText("");
      setRating(5);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_80px_-42px_rgba(66,72,121,0.18)] sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Customer Review</p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
          Share your TrustTrove experience
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Signed in as {user.email}. Leave a customer rating and short review for the homepage customer voices section.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <span className="mb-2 block text-sm font-bold text-slate-700">Your rating</span>
            <div className="flex flex-wrap gap-2">
              {RATINGS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${
                    rating === value
                      ? "bg-[var(--brand-navy)] text-white"
                      : "border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--brand-navy)]"
                  }`}
                >
                  {value} Star{value === 1 ? "" : "s"}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Headline</span>
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="Loved the delivery speed"
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-navy)] focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Your review</span>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows={5}
              placeholder="Tell other customers what stood out in your shopping experience."
              className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-navy)] focus:bg-white"
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {message ? <p className="text-sm text-[var(--brand-navy)]">{message}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#353a66] disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Submit Review"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-navy)] transition hover:bg-[var(--surface-soft)]"
            >
              Back Home
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
