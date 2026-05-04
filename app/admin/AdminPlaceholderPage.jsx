import Link from "next/link";

export default function AdminPlaceholderPage({ title, description }) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)] p-8 shadow-[0_20px_60px_-48px_rgba(66,72,121,0.24)]">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Coming Next</p>
      <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      <Link
        href="/admin"
        className="mt-6 inline-flex items-center rounded-full bg-[var(--brand-navy)] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
