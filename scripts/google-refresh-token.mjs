// One-time: get the GOOGLE_REFRESH_TOKEN the /contact booking picker uses.
//
//   1. Google Cloud console → enable "Google Calendar API".
//   2. OAuth consent screen: Internal (Workspace), or External + add yourself
//      as a test user.
//   3. Credentials → OAuth client ID → "Desktop app". Copy ID and secret.
//   4. GOOGLE_CLIENT_ID=… GOOGLE_CLIENT_SECRET=… node scripts/google-refresh-token.mjs
//   5. Open the printed URL, sign in as the calendar owner, allow.
//   6. Put the three values in Vercel env (and .env.local for live local).
import http from "node:http";

const id = process.env.GOOGLE_CLIENT_ID?.trim();
const secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
if (!id || !secret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  process.exit(1);
}
// The ID is public, so echo it: most "invalid_client" errors are a
// placeholder or a half-copied value.
console.log(`Client ID: ${id}`);
if (!/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(id)) {
  console.error(
    "That does not look like an OAuth client ID. Copy it again from\n" +
      "Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client IDs.\n" +
      "It looks like 123456789012-abc123….apps.googleusercontent.com"
  );
  process.exit(1);
}

const PORT = 53682;
const redirect = `http://127.0.0.1:${PORT}`;
const scope = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
].join(" ");

const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
url.search = new URLSearchParams({
  client_id: id,
  redirect_uri: redirect,
  response_type: "code",
  scope,
  access_type: "offline",
  prompt: "consent select_account",
}).toString();

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get("code");
  if (!code) return res.end("No code in the callback.");
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: id,
      client_secret: secret,
      redirect_uri: redirect,
      grant_type: "authorization_code",
    }),
  });
  const data = await tokenRes.json();
  res.end(data.refresh_token ? "Done. Back to the terminal." : "No refresh token, see the terminal.");
  if (data.refresh_token) console.log(`\nGOOGLE_REFRESH_TOKEN=${data.refresh_token}\n`);
  else console.error(data);
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Open this URL and allow access:\n\n${url}\n`);
});
