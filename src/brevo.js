/**
 * brevo.js — Brevo transactional email + WhatsApp notifications
 *
 * Required env vars (add to .env):
 *   VITE_BREVO_API_KEY      — your Brevo API key (Settings → API keys)
 *   VITE_NOTIFY_EMAIL       — admin email to receive booking/contact alerts
 *   VITE_NOTIFY_WHATSAPP    — WhatsApp number with country code, e.g. +37379000000
 *   VITE_FROM_EMAIL         — sender email (must be verified in Brevo)
 *   VITE_FROM_NAME          — sender display name, e.g. "MoldovaMoto"
 */

const API_KEY      = import.meta.env.VITE_BREVO_API_KEY      || "";
const NOTIFY_EMAIL = import.meta.env.VITE_NOTIFY_EMAIL        || "";
const NOTIFY_WA    = import.meta.env.VITE_NOTIFY_WHATSAPP     || "";
const FROM_EMAIL   = import.meta.env.VITE_FROM_EMAIL          || "no-reply@moldovamoto.com";
const FROM_NAME    = import.meta.env.VITE_FROM_NAME           || "MoldovaMoto";

const BREVO_EMAIL = "https://api.brevo.com/v3/smtp/email";
const BREVO_WA    = "https://api.brevo.com/v3/whatsapp/sendMessage";

const headers = () => ({
  "Content-Type": "application/json",
  "api-key": API_KEY,
});

// ── Shared fetch wrapper ──────────────────────────────────────────────────────
async function brevoPost(url, body) {
  if (!API_KEY) {
    console.warn("[Brevo] VITE_BREVO_API_KEY not set — skipping notification");
    return;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[Brevo] API error", res.status, err.message || err);
    }
  } catch (e) {
    console.error("[Brevo] Network error", e.message);
  }
}

// ── Email helpers ─────────────────────────────────────────────────────────────
function sendEmail({ to, subject, html, replyTo }) {
  if (!NOTIFY_EMAIL && !to) return;
  return brevoPost(BREVO_EMAIL, {
    sender:  { email: FROM_EMAIL, name: FROM_NAME },
    to:      [{ email: to || NOTIFY_EMAIL }],
    replyTo: replyTo ? { email: replyTo } : undefined,
    subject,
    htmlContent: html,
  });
}

// ── WhatsApp helper ───────────────────────────────────────────────────────────
// VITE_NOTIFY_WHATSAPP_SENDER = the WhatsApp Business number registered in
// Brevo → WhatsApp → Senders (must be registered before sending)
const WA_SENDER = import.meta.env.VITE_NOTIFY_WHATSAPP_SENDER || "";

function sendWhatsApp(to, message) {
  const receiver = (to || NOTIFY_WA).replace(/\D/g, "");
  const sender   = WA_SENDER.replace(/\D/g, "");
  if (!receiver) return;

  // If no sender number configured, skip WhatsApp silently (avoids 400 error)
  if (!sender) {
    console.warn("[Brevo] WhatsApp skipped: VITE_NOTIFY_WHATSAPP_SENDER not set." +
      " Register a sender in Brevo → WhatsApp → Senders, then add it to .env");
    return;
  }

  return brevoPost(BREVO_WA, {
    sender_to:   sender,    // your registered WhatsApp Business number
    receiver_to: receiver,  // recipient
    template_id: 1,
    params: { message },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notify admin when a new booking is submitted.
 * Sends email to NOTIFY_EMAIL + WhatsApp to NOTIFY_WHATSAPP.
 */
export async function notifyNewBooking(booking) {
  const isRental = booking.type === "rental";
  const dateStr  = isRental
    ? `${booking.date} → ${booking.dateTo || "?"} (${booking.rentalDays || 1} days)`
    : booking.date;

  const subject = `🏍️ New ${isRental ? "Rental" : "Tour"} Booking — ${booking.name}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f0f;color:#f0f0f4;border-radius:12px">
      <div style="background:#ff6b00;padding:16px 24px;border-radius:8px;margin-bottom:24px">
        <h1 style="margin:0;font-size:20px;color:#fff">🏍️ New Booking Request</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px">MoldovaMoto Admin Alert</p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row("Type",        isRental ? "🏍️ Free Motorcycle Rental" : "📅 Guided Tour")}
        ${row("Tour",        booking.tour)}
        ${row("Rider",       booking.name)}
        ${row("Email",       `<a href="mailto:${booking.email}" style="color:#ff6b00">${booking.email}</a>`)}
        ${row("Phone",       booking.phone || "—")}
        ${row("Country",     booking.country || "—")}
        ${row("Date",        dateStr)}
        ${row("Bike",        booking.bike || "—")}
        ${row("Experience",  booking.experience || "—")}
        ${row("Status",      `<span style="color:#eab308;font-weight:700">PENDING</span>`)}
        ${row("Booking ID",  `<code style="font-size:11px;color:#888">${booking.id}</code>`)}
      </table>

      <div style="margin-top:24px;padding:16px;background:#1a1a1a;border-radius:8px;border-left:4px solid #ff6b00">
        <p style="margin:0;font-size:13px;color:#888">
          Log in to the <a href="${window?.location?.origin || ""}/admin" style="color:#ff6b00">admin panel</a>
          to confirm or manage this booking.
        </p>
      </div>
    </div>
  `;

  const waText = `🏍️ NEW BOOKING — MoldovaMoto\n` +
    `Rider: ${booking.name}\n` +
    `Tour: ${booking.tour}\n` +
    `Date: ${dateStr}\n` +
    `Phone: ${booking.phone || "—"}\n` +
    `Status: PENDING ⏳`;

  await Promise.all([
    sendEmail({ subject, html, replyTo: booking.email }),
    sendWhatsApp(null, waText),
  ]);

  // Send confirmation email to the customer
  if (booking.email) {
    await sendEmail({
      to: booking.email,
      subject: `✅ Your booking request received — MoldovaMoto`,
      replyTo: NOTIFY_EMAIL,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f0f;color:#f0f0f4;border-radius:12px">
          <div style="background:#ff6b00;padding:16px 24px;border-radius:8px;margin-bottom:24px">
            <h1 style="margin:0;font-size:20px;color:#fff">✅ Booking Request Received</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px">MoldovaMoto</p>
          </div>
          <p style="font-size:15px;line-height:1.6">Hi <strong>${booking.name}</strong>,</p>
          <p style="font-size:14px;line-height:1.6;color:#ccc">
            We've received your ${isRental ? "rental" : "tour"} booking request and will confirm it
            within <strong>24 hours</strong>. Our team will contact you at
            <a href="mailto:${booking.email}" style="color:#ff6b00">${booking.email}</a>
            ${booking.phone ? `or ${booking.phone}` : ""}.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0">
            ${row("Tour",   booking.tour)}
            ${row("Date",   dateStr)}
            ${row("Bike",   booking.bike || "CFMOTO 800MT")}
          </table>
          <p style="font-size:13px;color:#888;margin-top:24px">
            Questions? Reply to this email or WhatsApp us at ${NOTIFY_WA || "+373 XX XXX XXX"}.
          </p>
          <p style="font-size:13px;color:#888">— The MoldovaMoto Team 🏍️</p>
        </div>
      `,
    });
  }
}

/**
 * Notify admin when a contact form message is submitted.
 */
export async function notifyContactForm({ name, email, message }) {
  const subject = `📩 New message from ${name} — MoldovaMoto`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f0f;color:#f0f0f4;border-radius:12px">
      <div style="background:#ff6b00;padding:16px 24px;border-radius:8px;margin-bottom:24px">
        <h1 style="margin:0;font-size:20px;color:#fff">📩 Contact Form Message</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row("From",    name)}
        ${row("Email",   `<a href="mailto:${email}" style="color:#ff6b00">${email}</a>`)}
        ${row("Message", `<span style="white-space:pre-wrap">${escHtml(message)}</span>`)}
      </table>
      <div style="margin-top:20px;padding:14px;background:#1a1a1a;border-radius:8px;border-left:4px solid #ff6b00">
        <p style="margin:0;font-size:13px;color:#888">Reply directly to this email to respond.</p>
      </div>
    </div>
  `;

  const waText = `📩 CONTACT FORM — MoldovaMoto\nFrom: ${name}\nEmail: ${email}\nMessage: ${message.slice(0, 200)}`;

  await Promise.all([
    sendEmail({ subject, html, replyTo: email }),
    sendWhatsApp(null, waText),
  ]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function row(label, value) {
  return `
    <tr style="border-bottom:1px solid #252525">
      <td style="padding:10px 12px;color:#888;font-weight:600;white-space:nowrap;width:120px">${label}</td>
      <td style="padding:10px 12px;color:#f0f0f4">${value}</td>
    </tr>`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
