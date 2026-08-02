import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type MembershipRole =
  Database["public"]["Enums"]["organisation_member_role"];

type UnauthenticatedContext = {
  status: "unauthenticated";
};

type NeedsOnboardingContext = {
  status: "needs_onboarding";
  email: string;
};

type ActiveMembershipContext = {
  status: "active_membership";
  email: string;
  membership: {
    role: MembershipRole;
  };
  organisation: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
  };
};

export type OrganisationContext =
  | UnauthenticatedContext
  | NeedsOnboardingContext
  | ActiveMembershipContext;

export class OrganisationContextError extends Error {
  constructor() {
    super("We could not load your organisation workspace right now.");
    this.name = "OrganisationContextError";
  }
}

export async function getOrganisationContext(): Promise<OrganisationContext> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const isAnonymous = claims?.is_anonymous === true;

  if (
    claimsError ||
    !claims ||
    typeof claims.sub !== "string" ||
    isAnonymous
  ) {
    return { status: "unauthenticated" };
  }

  const email =
    typeof claims.email === "string" ? claims.email : "Email unavailable";

  const { data: membership, error: membershipError } = await supabase
    .from("organisation_members")
    .select(
      `
        organisation_id,
        role,
        organisation:organisations!organisation_members_organisation_id_fkey (
          id,
          name,
          slug,
          timezone
        )
      `,
    )
    .eq("user_id", claims.sub)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    throw new OrganisationContextError();
  }

  if (!membership) {
    return { status: "needs_onboarding", email };
  }

  if (!membership.organisation) {
    throw new OrganisationContextError();
  }

  return {
    status: "active_membership",
    email,
    membership: {
      role: membership.role,
    },
    organisation: {
      id: membership.organisation.id,
      name: membership.organisation.name,
      slug: membership.organisation.slug,
      timezone: membership.organisation.timezone,
    },
  };
}
