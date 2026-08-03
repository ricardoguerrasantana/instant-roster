"use client";

import { useActionState, useState } from "react";

import {
  onboardOrganisation,
  type OnboardingActionState,
} from "@/app/app/onboarding/actions";

const INITIAL_STATE: OnboardingActionState = { message: "" };

function suggestSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
}

type OnboardingFormProps = {
  mutationsEnabled: boolean;
};

export function OnboardingForm({ mutationsEnabled }: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    onboardOrganisation,
    INITIAL_STATE,
  );
  const [organisationName, setOrganisationName] = useState("");
  const [organisationSlug, setOrganisationSlug] = useState("");
  const [slugWasEdited, setSlugWasEdited] = useState(false);

  return (
    <>
      {!mutationsEnabled ? (
        <aside
          className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-950"
          role="status"
        >
          <p className="font-semibold">Read-only Preview</p>
          <p className="mt-1 text-sm">
            Data changes are disabled here. You can review onboarding, but an
            organisation cannot be created from Preview.
          </p>
        </aside>
      ) : null}

      {state.message ? (
        <div
          aria-live="polite"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-6" noValidate>
        <div>
          <label className="block text-sm font-semibold" htmlFor="fullName">
            Full name
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.fullName ? "fullName-error" : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.fullName)}
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
            id="fullName"
            maxLength={100}
            minLength={2}
            name="fullName"
            required
            type="text"
          />
          {state.fieldErrors?.fullName ? (
            <p className="mt-2 text-sm text-red-700" id="fullName-error">
              {state.fieldErrors.fullName}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="block text-sm font-semibold"
            htmlFor="organisationName"
          >
            Organisation name
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.organisationName
                ? "organisationName-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.organisationName)}
            autoComplete="organization"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
            id="organisationName"
            maxLength={100}
            minLength={2}
            name="organisationName"
            onChange={(event) => {
              const nextName = event.target.value;
              setOrganisationName(nextName);

              if (!slugWasEdited) {
                setOrganisationSlug(suggestSlug(nextName));
              }
            }}
            required
            type="text"
            value={organisationName}
          />
          {state.fieldErrors?.organisationName ? (
            <p
              className="mt-2 text-sm text-red-700"
              id="organisationName-error"
            >
              {state.fieldErrors.organisationName}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="block text-sm font-semibold"
            htmlFor="organisationSlug"
          >
            Organisation slug
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.organisationSlug
                ? "organisationSlug-help organisationSlug-error"
                : "organisationSlug-help"
            }
            aria-invalid={Boolean(state.fieldErrors?.organisationSlug)}
            autoCapitalize="none"
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
            id="organisationSlug"
            maxLength={63}
            minLength={3}
            name="organisationSlug"
            onChange={(event) => {
              setSlugWasEdited(true);
              setOrganisationSlug(event.target.value.toLowerCase());
            }}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            spellCheck={false}
            type="text"
            value={organisationSlug}
          />
          <p className="mt-2 text-sm text-gray-600" id="organisationSlug-help">
            This short, URL-safe name will identify your organisation.
          </p>
          {state.fieldErrors?.organisationSlug ? (
            <p
              className="mt-2 text-sm text-red-700"
              id="organisationSlug-error"
            >
              {state.fieldErrors.organisationSlug}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold" htmlFor="timezone">
            Timezone
          </label>
          <select
            aria-describedby={
              state.fieldErrors?.timezone ? "timezone-error" : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.timezone)}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
            defaultValue="Australia/Brisbane"
            id="timezone"
            name="timezone"
            required
          >
            <option value="Australia/Brisbane">Australia/Brisbane</option>
          </select>
          {state.fieldErrors?.timezone ? (
            <p className="mt-2 text-sm text-red-700" id="timezone-error">
              {state.fieldErrors.timezone}
            </p>
          ) : null}
        </div>

        <button
          className="w-full rounded-lg bg-gray-950 px-4 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          disabled={pending || !mutationsEnabled}
          type="submit"
        >
          {pending ? "Creating organisation…" : "Create organisation"}
        </button>
      </form>
    </>
  );
}
