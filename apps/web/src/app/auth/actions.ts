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
  let failure: "invalid_credentials" | "sign_in_failed" | null = null;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      failure =
        error.code === "invalid_credentials"
          ? "invalid_credentials"
          : "sign_in_failed";
    }
  } catch {
    failure = "sign_in_failed";
  }

  if (failure === "invalid_credentials") {
    redirect("/login?error=invalid_credentials");
  }

  if (failure) {
    redirect("/login?error=sign_in_failed");
  }

  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/login");
}
