import Link from "next/link";

function ReviewStars({ rating }) {
  return (
    <div className="flex items-center gap-1 text-[var(--brand-gold)]">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rating ? "opacity-100" : "opacity-30"}>★</span>
      ))}
    </div>
  );
}

export default function HomeCustomerReviews({ reviews = [] }) {
  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Customer Voices</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--brand-navy)] sm:text-4xl">
              What customers are saying
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Real shopping feedback from GoModexa customers about delivery, product quality, and overall experience.
            </p>
          </div>
          <Link
            href="/share-feedback"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#353a66]"
          >
            Give Rating
          </Link>
        </div>

        {reviews.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_60px_-46px_rgba(66,72,121,0.18)]"
              >
                <ReviewStars rating={review.rating} />
                <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-2xl">
                  {review.headline || "Loved the shopping experience"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{review.reviewText}</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-sm font-black text-[var(--brand-navy)]">{review.displayName}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {review.city || "GoModexa customer"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-8 text-center shadow-[0_20px_60px_-46px_rgba(66,72,121,0.18)]">
            <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-2xl">No customer reviews yet</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Be the first customer to rate your GoModexa shopping experience and we&apos;ll show it here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

