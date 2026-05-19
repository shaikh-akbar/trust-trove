export default function PageLoadingState({
  eyebrow = "GoModexa",
  title = "Loading the next page",
  description = "We are preparing the next screen for you.",
}) {
  return (
    <section className="bg-[var(--surface-soft)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_30px_90px_-58px_rgba(8,15,43,0.28)]">
          <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,#141d60_0%,#28357b_100%)] px-6 py-8 text-white sm:px-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-white/70">{eyebrow}</p>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">{description}</p>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:px-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-soft)] p-5">
                  <div className="tt-skeleton h-4 w-24 rounded-full" />
                  <div className="tt-skeleton mt-4 h-10 w-full rounded-2xl" />
                  <div className="tt-skeleton mt-3 h-10 w-5/6 rounded-2xl" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-soft)] p-5">
                <div className="tt-skeleton h-4 w-28 rounded-full" />
                <div className="tt-skeleton mt-4 h-12 w-56 rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white"
                  >
                    <div className="tt-skeleton aspect-[4/4.6] w-full" />
                    <div className="space-y-3 p-4">
                      <div className="tt-skeleton h-3 w-20 rounded-full" />
                      <div className="tt-skeleton h-5 w-full rounded-full" />
                      <div className="tt-skeleton h-5 w-3/4 rounded-full" />
                      <div className="tt-skeleton h-4 w-24 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

