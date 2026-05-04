"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, Mail, LockKeyhole, MapPin, Phone, User } from "lucide-react";
import {
  forgotPasswordAction,
  resetPasswordAction,
  signinAction,
  signupAction,
} from "../../actions/auth";

function Field({ label, name, type = "text", placeholder, icon: Icon, error, defaultValue }) {
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-slate-500 transition ${
        error ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50 focus-within:border-slate-400 focus-within:bg-white"
      }`}>
        <Icon size={18} />
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="text-slate-400 transition hover:text-slate-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </span>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

function SubmitButton({ children, pending }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-[#3f477a] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.01] hover:bg-[#353c67] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <LoaderCircle size={16} className="mr-2 animate-spin" /> : null}
      {children}
    </button>
  );
}

function FormNotice({ error, success }) {
  if (!error && !success) {
    return null;
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${
      error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
    }`}>
      {error || success}
    </div>
  );
}

export function SignInForm({ redirectTo = "" }) {
  const [state, formAction, pending] = useActionState(signinAction, {});

  return (
    <form action={formAction} className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <FormNotice error={state?.formError} />
      <Field
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        error={state?.fieldErrors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        icon={LockKeyhole}
        error={state?.fieldErrors?.password}
      />

      <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/forgot-password" className="font-bold text-slate-900 hover:text-slate-600">
          Forgot password?
        </Link>
        <Link href="/signup" className="font-bold text-slate-900 hover:text-slate-600">
          Need an account?
        </Link>
      </div>

      <SubmitButton pending={pending}>Sign In</SubmitButton>
    </form>
  );
}

export function SignUpForm({ redirectTo = "" }) {
  const [state, formAction, pending] = useActionState(signupAction, {});

  return (
    <form action={formAction} className="grid gap-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-7">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="sm:col-span-2">
        <FormNotice error={state?.formError} />
      </div>
      <Field label="First Name" name="firstName" placeholder="Aarav" icon={User} error={state?.fieldErrors?.firstName} />
      <Field label="Last Name" name="lastName" placeholder="Sharma" icon={User} error={state?.fieldErrors?.lastName} />
      <div className="sm:col-span-2">
        <Field label="Email Address" name="email" type="email" placeholder="you@example.com" icon={Mail} error={state?.fieldErrors?.email} />
      </div>
      <Field label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210" icon={Phone} error={state?.fieldErrors?.phone} />
      <Field label="City" name="city" placeholder="Mumbai" icon={MapPin} error={state?.fieldErrors?.city} />
      <div className="sm:col-span-2">
        <Field label="Password" name="password" type="password" placeholder="Create password" icon={LockKeyhole} error={state?.fieldErrors?.password} />
      </div>

      <p className="sm:col-span-2 text-sm leading-6 text-slate-500">
        Your account is created in your custom `users` table and stored with a hashed password.
      </p>

      <div className="sm:col-span-2">
        <SubmitButton pending={pending}>Create Account</SubmitButton>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});

  return (
    <form action={formAction} className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <FormNotice error={state?.formError} success={state?.successMessage} />
      <Field
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        error={state?.fieldErrors?.email}
      />
      <p className="text-sm leading-6 text-slate-500">
        We&apos;ll send a 6-digit OTP to your email so you can reset your password.
      </p>
      <SubmitButton pending={pending}>Send OTP</SubmitButton>
      <Link href="/reset-password" className="block text-sm font-bold text-slate-900 hover:text-slate-600">
        Already have an OTP?
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ email = "" }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, {});

  return (
    <form action={formAction} className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <FormNotice error={state?.formError} success={state?.successMessage} />
      <Field
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        defaultValue={email}
        icon={Mail}
        error={state?.fieldErrors?.email}
      />
      <Field
        label="OTP"
        name="otp"
        placeholder="6-digit code"
        icon={LockKeyhole}
        error={state?.fieldErrors?.otp}
      />
      <Field
        label="New Password"
        name="password"
        type="password"
        placeholder="Choose a new password"
        icon={LockKeyhole}
        error={state?.fieldErrors?.password}
      />
      <SubmitButton pending={pending}>Reset Password</SubmitButton>
      <Link href="/signin" className="block text-sm font-bold text-slate-900 hover:text-slate-600">
        Back to sign in
      </Link>
    </form>
  );
}
