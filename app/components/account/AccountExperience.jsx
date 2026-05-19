import Link from "next/link";
import {
  CreditCard,
  Heart,
  Package,
} from "lucide-react";
import { ForgotPasswordForm, ResetPasswordForm, SignInForm, SignUpForm } from "./AuthForms";

const profileStats = [
  { label: "Orders placed", value: "12" },
  { label: "Wishlist saves", value: "38" },
  { label: "Trust points", value: "1,240" },
];

const orderHighlights = [
  {
    title: "Curated Sneaker Drop",
    detail: "Out for delivery on April 30",
    accent: "Tracking updated 2h ago",
  },
  {
    title: "Smart Desk Lamp",
    detail: "Packed and ready to ship",
    accent: "Expected by May 2",
  },
];

function ExperienceShell({ eyebrow, title, description, children, alternateAction }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f8fafc_100%)] py-14 sm:py-20">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(66,72,121,0.16)_0%,transparent_58%)] opacity-70" />
      <div className="absolute left-[-6rem] top-32 h-56 w-56 rounded-full bg-[rgba(66,72,121,0.12)] blur-3xl" />
      <div className="absolute right-[-5rem] bottom-10 h-64 w-64 rounded-full bg-slate-200/80 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-7 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-slate-600">
                {eyebrow}
              </span>
              <h1 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                {title}
              </h1>
            </div>
            {alternateAction}
          </div>

          <p className="max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            {description}
          </p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function SignInExperience({ redirectTo = "" }) {
  return (
    <ExperienceShell
      eyebrow="Sign In"
      title="Welcome back to your curated account."
      description="Sign in to revisit saved pieces, track active deliveries, and continue checkout without losing momentum."
      alternateAction={
        <Link
          href="/signup"
          className="inline-flex items-center rounded-full border border-[var(--line)] bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] px-5 py-3 text-sm font-bold text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)] hover:text-slate-950"
        >
          Create account
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr]">
        <SignInForm redirectTo={redirectTo} />

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] p-6 shadow-[0_18px_44px_-34px_rgba(66,72,121,0.18)] sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--brand-navy)]">
            Quick Access
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-2xl">
            Everything important stays one tap away.
          </h3>
          <ul className="mt-6 space-y-4">
            {[
              "Resume checkout with saved address and contact details.",
              "See delivery progress without digging through emails.",
              "Open your profile to manage orders, wishlist, and support.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--brand-navy)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ExperienceShell>
  );
}

export function SignUpExperience({ redirectTo = "" }) {
  return (
    <ExperienceShell
      eyebrow="Join GoModexa"
      title="Create your account and start shopping with confidence."
      description="Set up your member profile to unlock faster checkout, order tracking, curated drops, and saved favorites across devices."
      alternateAction={
        <Link
          href="/signin"
          className="inline-flex items-center rounded-full border border-[var(--line)] bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] px-5 py-3 text-sm font-bold text-[var(--brand-navy)] transition hover:border-[var(--brand-navy)] hover:text-slate-950"
        >
          Already a member
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr]">
        <SignUpForm redirectTo={redirectTo} />

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] p-6 shadow-[0_18px_44px_-34px_rgba(66,72,121,0.18)] sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--brand-navy)]">
            What You Unlock
          </p>
          <div className="mt-5 space-y-4">
            {[
              { icon: Heart, title: "Wishlist Sync", text: "Save products now and revisit them anytime." },
              { icon: CreditCard, title: "Faster Checkout", text: "Store delivery details for smoother reorders." },
              { icon: Package, title: "Order Hub", text: "Watch every shipment from packed to delivered." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="rounded-2xl bg-[var(--brand-navy)] p-3 text-white">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExperienceShell>
  );
}

export function ForgotPasswordExperience() {
  return (
    <ExperienceShell
      eyebrow="Password Reset"
      title="Reset access without losing your shopping momentum."
      description="Enter your email address and we'll send a one-time password to help you set a new password securely."
      alternateAction={
        <Link
          href="/signin"
          className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-900 hover:text-slate-950"
        >
          Back to sign in
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr]">
        <ForgotPasswordForm />

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
            Secure Reset
          </p>
          <ul className="mt-5 space-y-4">
            {[
              "OTP expires in 10 minutes for better protection.",
              "Only the latest OTP remains valid for the email address.",
              "Once the password changes, the OTP is marked as used.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--brand-navy)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ExperienceShell>
  );
}

export function ResetPasswordExperience({ email }) {
  return (
    <ExperienceShell
      eyebrow="Enter OTP"
      title="Finish resetting your password."
      description="Use the OTP from your inbox and choose a fresh password to regain access to your GoModexa account."
      alternateAction={
        <Link
          href="/forgot-password"
          className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-900 hover:text-slate-950"
        >
          Resend OTP
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr]">
        <ResetPasswordForm email={email} />

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] p-6 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--brand-navy)]">
            Helpful Tip
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-2xl">
            Didn&apos;t get the code?
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            Check your spam folder first. If nothing shows up, request a fresh OTP from the forgot password page.
          </p>
        </div>
      </div>
    </ExperienceShell>
  );
}

export function ProfileExperience({ user, logoutButton }) {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim() || user.email?.[0]?.toUpperCase() || "U";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <ExperienceShell
      eyebrow="My Profile"
      title="Your account, orders, and saved finds in one place."
      description="This profile layout gives customers a clear home for delivery progress, account details, wishlist activity, and support actions."
      alternateAction={
        logoutButton
      }
    >
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--brand-navy)] text-xl font-black text-white">
                {initials}
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-slate-950">{fullName || user.email}</p>
                <p className="text-sm text-slate-500">Signed in as {user.email}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {profileStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-2xl font-black tracking-tight text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              Saved Details
            </p>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
                Email: {user.email}
              </div>
              <div className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
                Delivery city: {user.city || "Not added yet"}
              </div>
              <div className="rounded-2xl border border-white bg-white px-4 py-4 shadow-sm">
                Account type: Email and password
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                  Recent Orders
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-2xl">
                  Delivery activity
                </h3>
              </div>
              <span className="rounded-full bg-[rgba(66,72,121,0.1)] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-navy)]">
                All good
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {orderHighlights.map((order) => (
                <div key={order.title} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black tracking-tight text-slate-950">{order.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{order.detail}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">
                      {order.accent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(135deg,#424879_0%,#353a66_100%)] p-6 text-white shadow-[0_20px_60px_-42px_rgba(66,72,121,0.35)]">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-200">
                Wishlist
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight">11 live picks</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/85">
                Sneakers, gadgets, and newly saved pieces ready for your next checkout.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,#f7f8fc_0%,#eef1fb_100%)] p-6 text-slate-950">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--brand-navy)]">
                Need Help?
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight">Support in minutes</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Open order help, shipping questions, or return requests from this account center.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ExperienceShell>
  );
}

