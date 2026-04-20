"use strict";
/**
 * server/brevo.js — server-side Brevo transactional email + WhatsApp.
 *
 * API key lives in process.env and NEVER reaches the browser. The frontend
 * calls /api/bookings and /api/contact; this module fires the outbound
 * notifications from the server.
 *
 * Env vars (server-only — do NOT prefix with VITE_):
 *   BREVO_API_KEY            — Brevo API key
 *   NOTIFY_EMAIL             — admin inbox for booking/contact alerts
 *   NOTIFY_WHATSAPP          — admin WhatsApp (country code + digits)
 *   NOTIFY_WHATSAPP_SENDER   — registered Brevo WA Business number
 *   FROM_EMAIL               — verified sender email
 *   FROM_NAME                — sender display name
 *   PUBLIC_ORIGIN            — origin used in admin links (e.g. https://moldovamoto.com)
 */

const API_KEY      = process.env.BREVO_API_KEY        || "";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL         || "";
const NOTIFY_WA    = process.env.NOTIFY_WHATSAPP      || "";
const WA_SENDER    = process.env.NOTIFY_WHATSAPP_SENDER || "";
const FROM_EMAIL   = process.env.FROM_EMAIL           || "no-reply@moldovamoto.com";
const FROM_NAME    = process.env.FROM_NAME            || "MoldovaMoto";
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN       || "";

const BREVO_EMAIL = "https://api.brevo.com/v3/smtp/email";
const BREVO_WA    = "https://api.brevo.com/v3/whatsapp/sendMessage";

async function brevoPost(url, body) {
  if (!API_KEY) {
    console.warn("[Brevo] BREVO_API_KEY not set — skipping notification");
    return;
  }
  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "api-key": API_KEY },
      body:    JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[Brevo] API error", res.status, err.message || err);
    }
  } catch (e) {
    console.error("[Brevo] Network error", e.message);
  }
}

function sendEmail({ to, subject, html, replyTo }) {
  if (!to && !NOTIFY_EMAIL) return;
  return brevoPost(BREVO_EMAIL, {
    sender:  { email: FROM_EMAIL, name: FROM_NAME },
    to:      [{ email: to || NOTIFY_EMAIL }],
    replyTo: replyTo ? { email: replyTo } : undefined,
    subject,
    htmlContent: html,
  });
}

function sendWhatsApp(to, message) {
  const receiver = (to || NOTIFY_WA).replace(/\D/g, "");
  const sender   = WA_SENDER.replace(/\D/g, "");
  if (!receiver || !sender) return; // silent skip when unconfigured
  return brevoPost(BREVO_WA, {
    sender_to:   sender,
    receiver_to: receiver,
    template_id: 1,
    params: { message },
  });
}

function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label, value) {
  return '<tr style="border-bottom:1px solid #252525">' +
    '<td style="padding:10px 12px;color:#888;font-weight:600;white-space:nowrap;width:120px">' + label + '</td>' +
    '<td style="padding:10px 12px;color:#f0f0f4">' + value + '</td></tr>';
}

async function notifyNewBooking(booking) {
  const isRental = booking.type === "rental";
  const e = {
    name:       escHtml(booking.name || ""),
    email:      escHtml(booking.email || ""),
    emailAttr:  encodeURIComponent(booking.email || ""),
    tour:       escHtml(booking.tour || ""),
    phone:      escHtml(booking.phone || ""),
    country:    escHtml(booking.country || ""),
    date:       escHtml(booking.date || ""),
    dateTo:     escHtml(booking.dateTo || ""),
    bike:       escHtml(booking.bike || ""),
    experience: escHtml(booking.experience || ""),
    id:         escHtml(booking.id || ""),
    rentalDays: Number(booking.rentalDays) || 1,
  };
  const dateStr = isRental ? (e.date + " → " + (e.dateTo || "?") + " (" + e.rentalDays + " days)") : e.date;
  const subject = "🏍️ New " + (isRental ? "Rental" : "Tour") + " Booking — " + (booking.name || "");

  const adminHtml = '' +
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f0f;color:#f0f0f4;border-radius:12px">' +
      '<div style="background:#ff6b00;padding:16px 24px;border-radius:8px;margin-bottom:24px">' +
        '<h1 style="margin:0;font-size:20px;color:#fff">🏍️ New Booking Request</h1>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:14px">' +
        row("Type",       isRental ? "🏍️ Free Motorcycle Rental" : "📅 Guided Tour") +
        row("Tour",       e.tour) +
        row("Rider",      e.name) +
        row("Email",      '<a href="mailto:' + e.emailAttr + '" style="color:#ff6b00">' + e.email + '</a>') +
        row("Phone",      e.phone || "—") +
        row("Country",    e.country || "—") +
        row("Date",       dateStr) +
        row("Bike",       e.bike || "—") +
        row("Experience", e.experience || "—") +
        row("Status",     '<span style="color:#eab308;font-weight:700">PENDING</span>') +
        row("Booking ID", '<code style="font-size:11px;color:#888">' + e.id + '</code>') +
      '</table>' +
      '<div style="margin-top:24px;padding:16px;background:#1a1a1a;border-radius:8px;border-left:4px solid #ff6b00">' +
        '<p style="margin:0;font-size:13px;color:#888">Admin panel: ' +
        '<a href="' + escHtml(PUBLIC_ORIGIN) + '/admin" style="color:#ff6b00">' + escHtml(PUBLIC_ORIGIN) + '/admin</a></p>' +
      '</div>' +
    '</div>';

  const waText = "🏍️ NEW BOOKING — MoldovaMoto\n" +
    "Rider: " + (booking.name || "") + "\n" +
    "Tour: "  + (booking.tour || "") + "\n" +
    "Date: "  + (booking.date || "") + (booking.dateTo ? " → " + booking.dateTo : "") + "\n" +
    "Phone: " + (booking.phone || "—") + "\n" +
    "Status: PENDING ⏳";

  const tasks = [
    sendEmail({ subject, html: adminHtml, replyTo: booking.email }),
    sendWhatsApp(null, waText),
  ];

  if (booking.email) {
    const confirmHtml = '' +
      '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f0f;color:#f0f0f4;border-radius:12px">' +
        '<div style="background:#ff6b00;padding:16px 24px;border-radius:8px;margin-bottom:24px">' +
          '<h1 style="margin:0;font-size:20px;color:#fff">✅ Booking Request Received</h1>' +
        '</div>' +
        '<p style="font-size:15px">Hi <strong>' + e.name + '</strong>,</p>' +
        '<p style="font-size:14px;color:#ccc">We\'ve received your ' +
          (isRental ? "rental" : "tour") + ' booking request and will confirm within <strong>24 hours</strong>.</p>' +
        '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0">' +
          row("Tour", e.tour) + row("Date", dateStr) + row("Bike", e.bike || "CFMOTO 800MT") +
        '</table>' +
        '<p style="font-size:13px;color:#888">— The MoldovaMoto Team 🏍️</p>' +
      '</div>';
    tasks.push(sendEmail({
      to: booking.email,
      subject: "✅ Your booking request received — MoldovaMoto",
      replyTo: NOTIFY_EMAIL,
      html: confirmHtml,
    }));
  }

  await Promise.all(tasks);
}

async function notifyContactForm({ name, email, message }) {
  const eName  = escHtml(name || "");
  const eEmail = escHtml(email || "");
  const eUrl   = encodeURIComponent(email || "");
  const subject = "📩 New message from " + (name || "anonymous") + " — MoldovaMoto";

  const html = '' +
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f0f0f;color:#f0f0f4;border-radius:12px">' +
      '<div style="background:#ff6b00;padding:16px 24px;border-radius:8px;margin-bottom:24px">' +
        '<h1 style="margin:0;font-size:20px;color:#fff">📩 Contact Form Message</h1>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:14px">' +
        row("From",    eName) +
        row("Email",   '<a href="mailto:' + eUrl + '" style="color:#ff6b00">' + eEmail + '</a>') +
        row("Message", '<span style="white-space:pre-wrap">' + escHtml(message || "") + '</span>') +
      '</table>' +
    '</div>';

  const waText = "📩 CONTACT FORM — MoldovaMoto\nFrom: " + (name || "") +
    "\nEmail: " + (email || "") + "\nMessage: " + String(message || "").slice(0, 200);

  await Promise.all([
    sendEmail({ subject, html, replyTo: email }),
    sendWhatsApp(null, waText),
  ]);
}

module.exports = { notifyNewBooking, notifyContactForm };
