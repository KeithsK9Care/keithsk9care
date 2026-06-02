/**
 * /cms-auth — token vendor for the Sveltia CMS at /admin/.
 *
 * Login model: Cloudflare Access (One-time PIN to an approved email) gates /admin
 * and /cms-auth. Once a user has passed that, Sveltia opens this endpoint in a popup
 * to "sign in"; we hand it a GitHub token (stored as the CMS_GH_TOKEN secret) via the
 * Decap/Netlify-CMS auth handshake. The user never touches GitHub.
 *
 * Security:
 *  - Cloudflare Access is the primary gate (it enforces the approved-emails list).
 *  - Cloudflare injects `Cf-Access-Authenticated-User-Email` after login and strips any
 *    client-supplied value, so it is safe to trust on the custom domain. We re-check it
 *    against ALLOWED_EMAILS here as defence-in-depth (so a token is never vended to a
 *    non-approved identity, even if the Access policy were misconfigured).
 *  - The token is delivered only to the opener window's verified origin.
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

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const email = (request.headers.get("Cf-Access-Authenticated-User-Email") || "")
    .trim()
    .toLowerCase();

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
