/**
 * brevo.js — thin client shim.
 *
 * Historically this file called Brevo directly from the browser using
 * VITE_BREVO_API_KEY, which leaked the secret into the production bundle.
 * Brevo is now invoked server-side (see server/brevo.js). The booking
 * endpoint fires admin + confirmation emails on its own, so the frontend
 * only needs to POST the contact form.
 */

const API_BASE = import.meta.env.VITE_API_URL || "/api";

/**
 * No-op on the client — kept for backwards compatibility with existing
 * call sites. The server now sends booking notifications when
 * POST /api/bookings succeeds.
 */
export async function notifyNewBooking(_booking) {
  return;
}

/**
 * Submit the contact form. The server sends the Brevo email + WhatsApp.
 * Returns the API response (or null on network failure, which callers
 * already tolerate).
 */
export async function notifyContactForm({ name, email, message }) {
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, message }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("[contact] API error", res.status, data);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("[contact] network error", e.message);
    return null;
  }
}
