"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    redirect("/login?error=missing_credentials");
  }

  const supabase = await createClient();
  let failure:
    | "invalid_credentials"
    | "email_not_confirmed"
    | "user_banned"
    | "rate_limited"
    | "auth_unavailable"
    | "sign_in_failed"
    | null = null;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          `Supabase sign-in failed (code=${error.code ?? "unknown"}, status=${error.status ?? "unknown"})`,
        );
      }

      switch (error.code) {
        case "invalid_credentials":
          failure = "invalid_credentials";
          break;
        case "email_not_confirmed":
          failure = "email_not_confirmed";
          break;
        case "user_banned":
          failure = "user_banned";
          break;
        case "over_request_rate_limit":
          failure = "rate_limited";
          break;
        case "request_timeout":
        case "unexpected_failure":
        case "email_provider_disabled":
          failure = "auth_unavailable";
          break;
        default:
          failure = "sign_in_failed";
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const errorName =
        error instanceof Error ? error.name : "unknown_exception";

      console.error(
        `Supabase sign-in request failed (name=${errorName})`,
      );
    }

    failure = "auth_unavailable";
  }

  if (failure) {
    redirect(`/login?error=${failure}`);
  }

  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/login");
}
