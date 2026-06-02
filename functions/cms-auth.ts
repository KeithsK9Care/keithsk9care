/**
 * /cms-auth — token vendor for the Sveltia CMS at /admin/.
 *
 * Login model: Cloudflare Access (One-time PIN to an approved email) gates /admin
 * and /cms-auth. Once a user has passed that, Sveltia opens this endpoint in a popup
 * to "sign in"; we hand it a GitHub token (the CMS_GH_TOKEN secret) via the
 * Decap/Netlify-CMS auth handshake. The user never touches GitHub.
 *
 * Identity: established by Cloudflare Access. On Pages Functions the reliable source
 * is the signed Access JWT (`Cf-Access-Jwt-Assertion`) — the convenience email header
 * isn't always injected. The request only reaches here AFTER Cloudflare Access has
 * validated that JWT (the path is gated), so reading the `email` claim is safe; we
 * re-check it against ALLOWED_EMAILS as defence-in-depth.
 *
 * To change editors: update BOTH this list and the Cloudflare Access policy.
 */

interface Env {
  CMS_GH_TOKEN?: string;
}

const ALLOWED_EMAILS = [
  "theobacon@hotmail.com",
  "ronaldvitova1990@gmail.com",
  "kgkershaw7201@gmail.com",
];

function b64urlDecode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return atob(s);
}

function getEmail(request: Request): { email: string; source: string } {
  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (jwt && jwt.split(".").length === 3) {
    try {
      const claims = JSON.parse(b64urlDecode(jwt.split(".")[1]));
      if (typeof claims.email === "string" && claims.email) {
        return { email: claims.email.trim().toLowerCase(), source: "jwt" };
      }
      return { email: "", source: "jwt-no-email[" + Object.keys(claims).join(",") + "]" };
    } catch {
      return { email: "", source: "jwt-parse-error" };
    }
  }
  const hdr = request.headers.get("Cf-Access-Authenticated-User-Email");
  if (hdr) return { email: hdr.trim().toLowerCase(), source: "header" };
  return { email: "", source: "no-jwt-no-header" };
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const { email } = getEmail(request);

  if (!email || !ALLOWED_EMAILS.includes(email)) {
    return new Response(
      "Not authorised. The content editor is for approved editors only.",
      { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const token = env.CMS_GH_TOKEN;
  if (!token) {
    return new Response(
      "Editor not configured yet (missing token). Please contact RV-Web.",
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  // Decap/Netlify-CMS auth handshake: hand the token to the CMS window.
  const message =
    "authorization:github:success:" + JSON.stringify({ token, provider: "github" });

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Signing in...</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;color:#26201a">
<p>Signing you in... this window should close automatically.</p>
<script>
(function () {
  function receive(e) {
    if (window.opener) { window.opener.postMessage(${JSON.stringify(message)}, e.origin); }
    window.removeEventListener("message", receive, false);
    setTimeout(function () { window.close(); }, 300);
  }
  window.addEventListener("message", receive, false);
  if (window.opener) { window.opener.postMessage("authorizing:github", "*"); }
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
};
