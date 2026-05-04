"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Mail, MapPin, Phone, User, X } from "lucide-react";
import { updateProfileAction } from "../../actions/auth";

function Field({ label, name, type = "text", defaultValue, icon: Icon, error, readOnly = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
          error
            ? "border-rose-300 bg-rose-50 text-rose-600"
            : readOnly
              ? "border-slate-200 bg-slate-100 text-slate-500"
              : "border-slate-200 bg-slate-50 text-slate-500 focus-within:border-[#161f66] focus-within:bg-white"
        }`}
      >
        <Icon size={18} />
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          readOnly={readOnly}
          className="w-full bg-transparent text-sm text-slate-900 outline-none read-only:text-slate-500"
        />
      </span>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

export default function ProfileEditorModal({ profile, triggerLabel = "Edit Profile", triggerVariant = "primary" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateProfileAction, {});

  const triggerClassName =
    triggerVariant === "secondary"
      ? "inline-flex items-center gap-2 rounded-full bg-[#161f66] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#111952]"
      : "inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#161f66] transition hover:bg-white/90";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
          <div className="absolute inset-0" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative z-10 mx-auto flex min-h-full w-full items-start justify-center sm:items-center">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[1.6rem] border border-white/20 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] sm:rounded-[2rem] md:max-h-[88vh]">
            <div className="shrink-0 bg-[linear-gradient(135deg,#161f66_0%,#27318e_55%,#dcb86a_150%)] px-5 py-4 text-white sm:px-7 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">Account Center</p>
                  <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                    Edit personal information
                  </h2>
                  <p className="mt-2 text-sm text-white/80">
                    Update your profile details right here without leaving the dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white/12 p-2 text-white transition hover:bg-white/20"
                  aria-label="Close profile editor"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form action={formAction} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
              {state?.formError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {state.formError}
                </div>
              ) : null}

              {state?.successMessage ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {state.successMessage}
                  </div>
                  <div className="mt-5 flex justify-end border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        router.refresh();
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="First Name"
                      name="firstName"
                      defaultValue={profile.firstName}
                      icon={User}
                      error={state?.fieldErrors?.firstName}
                    />
                    <Field
                      label="Last Name"
                      name="lastName"
                      defaultValue={profile.lastName}
                      icon={User}
                      error={state?.fieldErrors?.lastName}
                    />
                    <div className="sm:col-span-2">
                      <Field label="Email Address" name="email" type="email" defaultValue={profile.email} icon={Mail} readOnly />
                    </div>
                    <Field
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      defaultValue={profile.phone}
                      icon={Phone}
                      error={state?.fieldErrors?.phone}
                    />
                    <Field
                      label="City"
                      name="city"
                      defaultValue={profile.city}
                      icon={MapPin}
                      error={state?.fieldErrors?.city}
                    />
                  </div>

                  <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="inline-flex items-center justify-center rounded-full bg-[#161f66] px-5 py-3 text-sm font-bold text-white hover:bg-[#111952] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {pending ? <LoaderCircle size={16} className="mr-2 animate-spin" /> : null}
                      Save changes
                    </button>
                  </div>
                </>
              )}
            </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
