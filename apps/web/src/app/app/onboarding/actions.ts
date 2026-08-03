"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  assertMutationsAllowed,
  MutationsDisabledError,
} from "@/lib/environment/mutations";
import { getOrganisationContext } from "@/lib/organisations/context";
import { createClient } from "@/lib/supabase/server";

const SUPPORTED_TIMEZONE = "Australia/Brisbane";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type OnboardingField =
  | "fullName"
  | "organisationName"
  | "organisationSlug"
  | "timezone";

export type OnboardingActionState = {
  message: string;
  fieldErrors?: Partial<Record<OnboardingField, string>>;
};

function normaliseName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function readString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function validateOnboardingInput(formData: FormData) {
  const fullName = normaliseName(readString(formData, "fullName"));
  const organisationName = normaliseName(
    readString(formData, "organisationName"),
  );
  const organisationSlug = readString(
    formData,
    "organisationSlug",
  ).trim();
  const timezone = readString(formData, "timezone").trim();
  const fieldErrors: Partial<Record<OnboardingField, string>> = {};

  if (fullName.length < 2 || fullName.length > 100) {
    fieldErrors.fullName = "Enter a full name between 2 and 100 characters.";
  }

  if (organisationName.length < 2 || organisationName.length > 100) {
    fieldErrors.organisationName =
      "Enter an organisation name between 2 and 100 characters.";
  }

  if (
    organisationSlug.length < 3 ||
    organisationSlug.length > 63 ||
    !SLUG_PATTERN.test(organisationSlug)
  ) {
    fieldErrors.organisationSlug =
      "Use 3 to 63 lowercase letters, numbers, and single hyphens.";
  }

  if (timezone !== SUPPORTED_TIMEZONE) {
    fieldErrors.timezone = "Select the supported organisation timezone.";
  }

  return {
    data: {
      fullName,
      organisationName,
      organisationSlug,
      timezone,
    },
    fieldErrors,
  };
}

function safeRpcError(message: string, code?: string): OnboardingActionState {
  const normalisedMessage = message.toLowerCase();

  if (
    code === "23505" ||
    normalisedMessage.includes("slug is already in use")
  ) {
    return {
      message: "That organisation slug is already in use.",
      fieldErrors: {
        organisationSlug: "Choose a different organisation slug.",
      },
    };
  }

  if (normalisedMessage.includes("active organisation membership")) {
    return {
      message: "Your account already belongs to an organisation.",
    };
  }

  if (code === "22023") {
    return {
      message: "Check the organisation details and try again.",
    };
  }

  if (code === "42501") {
    return {
      message: "Your session could not be verified. Sign in again.",
    };
  }

  return {
    message: "We could not create your organisation right now. Try again.",
  };
}

export async function onboardOrganisation(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const context = await getOrganisationContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  if (context.status === "active_membership") {
    redirect("/app");
  }

  try {
    assertMutationsAllowed();
  } catch (error) {
    if (error instanceof MutationsDisabledError) {
      return { message: error.message };
    }

    return { message: "Data changes are not available right now." };
  }

  const { data, fieldErrors } = validateOnboardingInput(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.rpc("onboard_organisation", {
      organisation_name: data.organisationName,
      organisation_slug: data.organisationSlug,
      organisation_timezone: data.timezone,
      profile_full_name: data.fullName,
    });

    if (error) {
      return safeRpcError(error.message, error.code);
    }
  } catch {
    return {
      message: "We could not create your organisation right now. Try again.",
    };
  }

  revalidatePath("/app");
  revalidatePath("/app/onboarding");
  redirect("/app");
}
