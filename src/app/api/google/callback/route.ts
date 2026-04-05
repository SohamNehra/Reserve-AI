import { NextResponse } from "next/server";
import { exchangeCodeForTokens, decodeOAuthState } from "@/lib/google/oauth";
import { supabaseAdmin } from "@/lib/supabase/server";

// This route is PUBLIC — Clerk middleware is bypassed (see proxy.ts/middleware.ts).
// Identity is established via the `state` param (base64url-encoded userId).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error"); // user denied consent

  const base = process.env.NEXT_PUBLIC_APP_URL!;

  // User denied or Google error
  if (error) {
    return NextResponse.redirect(`${base}/dashboard?google=denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${base}/dashboard?google=error&reason=missing_params`);
  }

  // Decode userId from state
  let userId: string;
  try {
    userId = decodeOAuthState(state);
    if (!userId) throw new Error("empty");
  } catch {
    return NextResponse.redirect(`${base}/dashboard?google=error&reason=bad_state`);
  }

  // Exchange code → tokens
  let tokens: Awaited<ReturnType<typeof exchangeCodeForTokens>>;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "exchange_failed";
    console.error("Google token exchange failed:", err);
    return NextResponse.redirect(
      `${base}/dashboard?google=error&reason=${encodeURIComponent(reason)}`
    );
  }

  // Persist tokens — update by clerk_user_id (no Clerk session available here)
  const { error: dbError } = await supabaseAdmin
    .from("businesses")
    .update({
      google_calendar_connected: true,
      google_access_token:       tokens.access_token,
      google_refresh_token:      tokens.refresh_token,
      google_calendar_id:        "primary",
    })
    .eq("clerk_user_id", userId);

  if (dbError) {
    console.error("Failed to save Google tokens:", dbError);
    return NextResponse.redirect(`${base}/dashboard?google=error&reason=db_save_failed`);
  }

  return NextResponse.redirect(`${base}/dashboard?google=connected`);
}
