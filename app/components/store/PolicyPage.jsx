import Link from "next/link";

export function PolicyHero({ eyebrow, title, description }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f8fafc_100%)] py-16 sm:py-20">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(66,72,121,0.16)_0%,transparent_58%)] opacity-70" />
      <div className="absolute left-[-6rem] top-32 h-56 w-56 rounded-full bg-[rgba(66,72,121,0.12)] blur-3xl" />
      <div className="absolute right-[-5rem] bottom-10 h-64 w-64 rounded-full bg-slate-200/80 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--brand-gold)]">{eyebrow}</p>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--brand-navy)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}

export function PolicySection({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-white p-7 shadow-[0_24px_72px_-54px_rgba(8,15,43,0.36)] sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-[var(--brand-navy)] sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">{children}</div>
    </section>
  );
}

export function PolicyBulletList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand-navy)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PolicyFooterNote() {
  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] p-6 text-sm leading-7 text-slate-700 sm:p-7">
      Questions about these policies can be shared through the <Link href="/contact-us" className="font-bold text-[var(--brand-navy)] hover:text-slate-950">Contact Us</Link> page. GoModexa will review and update these pages whenever store operations, shipping practices, or customer support processes change.
    </div>
  );
}

