import { google } from "googleapis";

function createClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

/**
 * Build the Google OAuth consent URL.
 * State = base64url(userId) — decoded in the callback to identify the user
 * without requiring a Clerk session (callback is a public route).
 */
export function getGoogleAuthUrl(userId: string): string {
  const client = createClient();
  const state = Buffer.from(userId).toString("base64url");
  return client.generateAuthUrl({
    access_type: "offline",   // required for refresh_token
    prompt: "consent",        // forces consent screen every time → always returns refresh_token
    scope: ["https://www.googleapis.com/auth/calendar"],
    state,
  });
}

/** Decode the state param back to a userId. Throws if malformed. */
export function decodeOAuthState(state: string): string {
  return Buffer.from(state, "base64url").toString("utf-8");
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expiry_date: number | null;
}> {
  const client = createClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token) throw new Error("No access_token in response");
  if (!tokens.refresh_token) {
    // With prompt=consent this shouldn't happen, but guard anyway
    throw new Error(
      "No refresh_token returned. Revoke app access in Google account and try again."
    );
  }

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date ?? null,
  };
}

/**
 * Create an authenticated OAuth2 client ready to make Calendar API calls.
 * Attaches a `tokens` listener — when googleapis auto-refreshes the access
 * token, `onTokenRefresh` is called so the caller can persist the new value.
 */
export function createAuthedOAuthClient(
  accessToken: string,
  refreshToken: string,
  onTokenRefresh: (newAccessToken: string) => void,
) {
  const client = createClient();
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Fires whenever the library silently refreshes the access token
  client.on("tokens", (tokens) => {
    if (tokens.access_token) {
      onTokenRefresh(tokens.access_token);
    }
  });

  return client;
}
