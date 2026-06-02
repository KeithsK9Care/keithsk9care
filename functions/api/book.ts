/**
 * /api/book — receives booking form POST from /book/, sends email to Keith.
 *
 * Email transport: Resend (https://resend.com — free tier 100/day, 3k/month).
 * Set RESEND_API_KEY in Cloudflare Pages → Settings → Environment variables.
 *
 * Behaviour:
 *  - Honeypot "company" filled → silent success (bots don't retry).
 *  - Missing/invalid fields → /book/?status=invalid (friendly banner on the page).
 *  - RESEND_API_KEY set + send OK → /thanks/.
 *  - RESEND_API_KEY set + send FAILS → /book/?status=error. We never claim a
 *    "thanks" we didn't actually deliver.
 *  - RESEND_API_KEY not set (pre-launch) → log the submission + /thanks/.
 *
 * Rate limiting: best configured via Cloudflare's dashboard rate-limit rules (or a
 * KV / Durable Object) — not in-process, since Workers isolates don't share memory.
 * The honeypot handles the bulk of automated spam.
 */

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;   // e.g. "Keith's K9 Care <bookings@keithsk9care.co.uk>"
  RESEND_TO?: string;     // e.g. "keith@keithsk9care.co.uk"
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const redirect = (path: string) =>
    Response.redirect(new URL(path, request.url).toString(), 303);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return redirect("/book/?status=invalid");
  }

  // Honeypot — silently treat as success so bots don't retry
  if (formData.get("company")) {
    return redirect("/thanks/");
  }

  // Validate required fields
  const name    = (formData.get("name")    || "").toString().trim();
  const email   = (formData.get("email")   || "").toString().trim();
  const phone   = (formData.get("phone")   || "").toString().trim();
  const dogName = (formData.get("dogName") || "").toString().trim();
  const breed   = (formData.get("breed")   || "").toString().trim();
  const service = (formData.get("service") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  if (!name || !email || !message) {
    return redirect("/book/?status=invalid");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect("/book/?status=invalid");
  }

  // Build the email body
  const subject = `New booking enquiry from ${name}`;
  const lines = [
    `Name:    ${name}`,
    `Email:   ${email}`,
    phone   ? `Phone:   ${phone}`   : "",
    dogName ? `Dog:     ${dogName}` : "",
    breed   ? `Breed:   ${breed}`   : "",
    service ? `Service: ${service}` : "",
    "",
    "Message:",
    message,
    "",
    "—",
    "Sent from the keithsk9care.co.uk booking form.",
  ].filter(Boolean);
  const text = lines.join("\n");

  const apiKey = env.RESEND_API_KEY;
  const from   = env.RESEND_FROM || "Keith's K9 Care <bookings@keithsk9care.co.uk>";
  const to     = env.RESEND_TO   || "keith@keithsk9care.co.uk";

  if (apiKey) {
    let delivered = false;
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, reply_to: email, subject, text }),
      });
      delivered = r.ok;
      if (!r.ok) {
        const body = await r.text().catch(() => "(no body)");
        console.error("Resend API error", r.status, body);
      }
    } catch (e) {
      console.error("Resend network error", e);
    }
    // Never claim a success we didn't deliver — surface the failure to the user.
    if (!delivered) {
      return redirect("/book/?status=error");
    }
  } else {
    // No email transport configured (pre-launch) — log so it's still recoverable.
    console.log("[BOOKING SUBMISSION — RESEND_API_KEY not set]");
    console.log(text);
  }

  return redirect("/thanks/");
};
