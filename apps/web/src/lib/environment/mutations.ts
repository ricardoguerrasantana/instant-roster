import "server-only";

const MUTATIONS_DISABLED_MESSAGE =
  "Data changes are disabled in this environment. Preview remains read-only.";

export class MutationsDisabledError extends Error {
  readonly code = "mutations_disabled";

  constructor() {
    super(MUTATIONS_DISABLED_MESSAGE);
    this.name = "MutationsDisabledError";
  }
}

export function mutationsAreEnabled() {
  const vercelEnvironment = process.env.VERCEL_ENV;

  if (vercelEnvironment === "preview") {
    return false;
  }

  if (
    vercelEnvironment !== undefined &&
    vercelEnvironment !== "development" &&
    vercelEnvironment !== "production"
  ) {
    return false;
  }

  return process.env.APP_MUTATIONS_ENABLED === "true";
}

export function assertMutationsAllowed() {
  if (!mutationsAreEnabled()) {
    throw new MutationsDisabledError();
  }
}
