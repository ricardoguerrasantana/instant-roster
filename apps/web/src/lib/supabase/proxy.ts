import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";

const AUTH_RESPONSE_HEADERS = ["cache-control", "expires", "pragma"];

function copyAuthResponse(
  source: NextResponse,
  destination: NextResponse,
) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie);
  });

  AUTH_RESPONSE_HEADERS.forEach((name) => {
    const value = source.headers.get(name);

    if (value) {
      destination.headers.set(name, value);
    }
  });

  return destination;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Create a fresh client for every request. A shared server client could
  // leak one user's session into another request on a reused server instance.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([name, value]) => {
            supabaseResponse.headers.set(name, value);
          });
        },
      },
    },
  );

  // getClaims validates the access token. getSession must not be used as
  // proof of identity because its cookie-backed user data is not revalidated.
  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims);

  const isApplicationRoute =
    request.nextUrl.pathname === "/app" ||
    request.nextUrl.pathname.startsWith("/app/");

  if (!isAuthenticated && isApplicationRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";

    return copyAuthResponse(
      supabaseResponse,
      NextResponse.redirect(loginUrl),
    );
  }

  return supabaseResponse;
}
