"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, getSessionUser } from "../../lib/auth/session";
import { generateOtp, getOtpExpiryIso, hashOtp, isOtpExpired } from "../../lib/auth/otp";
import { sendPasswordResetOtp } from "../../lib/auth/mail";
import { hashPassword, verifyPassword } from "../../lib/auth/password";
import { isAdminEmail } from "../../lib/admin-access";
import { getSupabaseAdmin } from "../../lib/supabase-admin";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPasswordStrong(password) {
  return password.length >= 8;
}

function buildFieldErrors(entries) {
  return Object.fromEntries(
    Object.entries(entries).filter(([, value]) => value),
  );
}

function validateSignupInput(formData) {
  const firstName = normalizeText(formData.get("firstName"));
  const lastName = normalizeText(formData.get("lastName"));
  const email = normalizeEmail(formData.get("email"));
  const phone = normalizeText(formData.get("phone"));
  const city = normalizeText(formData.get("city"));
  const password = String(formData.get("password") ?? "");

  const fieldErrors = buildFieldErrors({
    firstName: !firstName ? "First name is required." : "",
    email: !email ? "Email is required." : !isEmailValid(email) ? "Enter a valid email address." : "",
    password: !password ? "Password is required." : !isPasswordStrong(password) ? "Password must be at least 8 characters." : "",
  });

  return {
    values: { firstName, lastName, email, phone, city, password },
    fieldErrors,
  };
}

function validateSigninInput(formData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const redirectTo = normalizeText(formData.get("redirectTo"));

  const fieldErrors = buildFieldErrors({
    email: !email ? "Email is required." : !isEmailValid(email) ? "Enter a valid email address." : "",
    password: !password ? "Password is required." : "",
  });

  return {
    values: { email, password, redirectTo },
    fieldErrors,
  };
}

function getSafeRedirectPath(value, fallback = "/profile") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function validateForgotInput(formData) {
  const email = normalizeEmail(formData.get("email"));

  return {
    email,
    fieldErrors: buildFieldErrors({
      email: !email ? "Email is required." : !isEmailValid(email) ? "Enter a valid email address." : "",
    }),
  };
}

function validateResetInput(formData) {
  const email = normalizeEmail(formData.get("email"));
  const otp = normalizeText(formData.get("otp"));
  const password = String(formData.get("password") ?? "");

  return {
    values: { email, otp, password },
    fieldErrors: buildFieldErrors({
      email: !email ? "Email is required." : !isEmailValid(email) ? "Enter a valid email address." : "",
      otp: !otp ? "OTP is required." : otp.length !== 6 ? "OTP must be 6 digits." : "",
      password: !password ? "New password is required." : !isPasswordStrong(password) ? "Password must be at least 8 characters." : "",
    }),
  };
}

function validateProfileUpdateInput(formData) {
  const firstName = normalizeText(formData.get("firstName"));
  const lastName = normalizeText(formData.get("lastName"));
  const phone = normalizeText(formData.get("phone"));
  const city = normalizeText(formData.get("city"));

  return {
    values: { firstName, lastName, phone, city },
    fieldErrors: buildFieldErrors({
      firstName: !firstName ? "First name is required." : "",
    }),
  };
}

async function findUserByEmail(email) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, phone, city, password, created_at")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signupAction(_prevState, formData) {
  const { values, fieldErrors } = validateSignupInput(formData);
  const redirectTo = getSafeRedirectPath(normalizeText(formData.get("redirectTo")), "/profile");

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const existingUser = await findUserByEmail(values.email);

  if (existingUser) {
    return {
      formError: "An account with this email already exists.",
    };
  }

  const supabase = getSupabaseAdmin();
  const passwordHash = hashPassword(values.password);
  const { data, error } = await supabase
    .from("users")
    .insert({
      first_name: values.firstName,
      last_name: values.lastName || null,
      email: values.email,
      phone: values.phone || null,
      city: values.city || null,
      password: passwordHash,
    })
    .select("id, first_name, last_name, email, city")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        formError: "This email or phone number is already in use.",
      };
    }

    return {
      formError: "We could not create your account right now. Please try again.",
    };
  }

  await createSession(data);
  redirect(redirectTo);
}

export async function signinAction(_prevState, formData) {
  const { values, fieldErrors } = validateSigninInput(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const user = await findUserByEmail(values.email);

  if (!user || !verifyPassword(values.password, user.password)) {
    return {
      formError: "Invalid email or password.",
    };
  }

  await createSession(user);
  const fallbackPath = isAdminEmail(user.email) ? "/admin" : "/profile";
  redirect(getSafeRedirectPath(values.redirectTo, fallbackPath));
}

export async function forgotPasswordAction(_prevState, formData) {
  const { email, fieldErrors } = validateForgotInput(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return {
      formError: "We could not find an account with that email address.",
    };
  }

  const otp = generateOtp();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("password_reset_otps")
    .upsert(
      {
        email,
        otp_hash: hashOtp(otp),
        expires_at: getOtpExpiryIso(),
        used_at: null,
      },
      { onConflict: "email" },
    );

  if (error) {
    return {
      formError:
        process.env.NODE_ENV === "development"
          ? `We could not start the reset flow: ${error.message}`
          : "We could not start the reset flow. Please try again.",
    };
  }

  try {
    await sendPasswordResetOtp({
      email,
      firstName: user.first_name,
      otp,
    });
  } catch (mailError) {
    return {
      formError: mailError.message,
    };
  }

  redirect(`/reset-password?email=${encodeURIComponent(email)}`);
}

export async function resetPasswordAction(_prevState, formData) {
  const { values, fieldErrors } = validateResetInput(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = getSupabaseAdmin();
  const { data: otpRow, error: otpError } = await supabase
    .from("password_reset_otps")
    .select("email, otp_hash, expires_at, used_at")
    .eq("email", values.email)
    .maybeSingle();

  if (otpError) {
    return {
      formError:
        process.env.NODE_ENV === "development"
          ? `We could not verify the OTP right now: ${otpError.message}`
          : "We could not verify the OTP right now. Please try again.",
    };
  }

  if (!otpRow || otpRow.used_at || isOtpExpired(otpRow.expires_at)) {
    return {
      formError: "This OTP is invalid or has expired. Please request a new one.",
    };
  }

  if (otpRow.otp_hash !== hashOtp(values.otp)) {
    return {
      fieldErrors: { otp: "Incorrect OTP. Please try again." },
    };
  }

  const user = await findUserByEmail(values.email);

  if (!user) {
    return {
      formError: "We could not find your account anymore. Please sign up again.",
    };
  }

  const { error: updateUserError } = await supabase
    .from("users")
    .update({
      password: hashPassword(values.password),
    })
    .eq("email", values.email);

  if (updateUserError) {
    return {
      formError:
        process.env.NODE_ENV === "development"
          ? `We could not update your password: ${updateUserError.message}`
          : "We could not update your password. Please try again.",
    };
  }

  const { error: updateOtpError } = await supabase
    .from("password_reset_otps")
    .update({
      used_at: new Date().toISOString(),
    })
    .eq("email", values.email);

  if (updateOtpError) {
    return {
      formError:
        process.env.NODE_ENV === "development"
          ? `Password changed, but OTP cleanup failed: ${updateOtpError.message}`
          : "Password changed, but OTP cleanup failed. Please contact support if this repeats.",
    };
  }

  return {
    successMessage: "Password updated successfully. You can sign in now.",
  };
}

export async function updateProfileAction(_prevState, formData) {
  const { values, fieldErrors } = validateProfileUpdateInput(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const session = await getSessionUser();

  if (!session) {
    return {
      formError: "Your session expired. Please sign in again.",
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .update({
      first_name: values.firstName,
      last_name: values.lastName || null,
      phone: values.phone || null,
      city: values.city || null,
    })
    .eq("id", session.id)
    .select("id, first_name, last_name, email, phone, city")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        formError: "That phone number is already linked to another account.",
      };
    }

    return {
      formError:
        process.env.NODE_ENV === "development"
          ? `We could not update your profile: ${error.message}`
          : "We could not update your profile right now. Please try again.",
    };
  }

  await createSession(data);

  return {
    successMessage: "Profile updated successfully.",
  };
}

export async function logoutAction() {
  await clearSession();
  redirect("/signin");
}
