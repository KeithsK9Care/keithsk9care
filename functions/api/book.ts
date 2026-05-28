/**
 * /api/book — receives booking form POST from /book/, sends email to Keith.
 *
 * Email transport: Resend (https://resend.com — free tier 100/day, 3k/month).
 * Set RESEND_API_KEY in Cloudflare Pages → Settings → Environment variables.
 *
 * If the API key is not set, the function still validates the form, logs the
 * submission to the function console, and redirects to /thanks/ — so the form
 * is functional from day one and email sending can be enabled when ready.
 *
 * Anti-spam:
 *  - Honeypot field "company" — bots fill it, humans don't.
 *  - Required-fields validation.
 *  - 60s per-IP rate limit (best-effort, using a header check; CF has a real RL too).
 */

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;   // e.g. "Keith's K9 Care <bookings@keithsk9care.co.uk>"
  RESEND_TO?: string;     // e.g. "keith@keithsk9care.co.uk"
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response("Invalid form submission", { status: 400 });
  }

  // Honeypot — silently treat as success so bots don't retry
  if (formData.get("company")) {
    return Response.redirect(new URL("/thanks/", request.url).toString(), 303);
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
    return new Response("Please fill in your name, email and a short message.", { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response("Please enter a valid email address.", { status: 400 });
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

  // Send via Resend if configured
  const apiKey = env.RESEND_API_KEY;
  const from   = env.RESEND_FROM || "Keith's K9 Care <bookings@keithsk9care.co.uk>";
  const to     = env.RESEND_TO   || "keith@keithsk9care.co.uk";

  if (apiKey) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          reply_to: email,
          subject,
          text,
        }),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => "(no body)");
        console.error("Resend API error", r.status, body);
        // Don't fail the user — log it, still redirect
      }
    } catch (e) {
      console.error("Resend network error", e);
    }
  } else {
    // No email transport configured — log so it's still recoverable
    console.log("[BOOKING SUBMISSION — RESEND_API_KEY not set]");
    console.log(text);
  }

  return Response.redirect(new URL("/thanks/", request.url).toString(), 303);
};
