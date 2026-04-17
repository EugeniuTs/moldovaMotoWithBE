"use strict";

/**
 * Input validation + sanitisation for booking payloads.
 *
 * Mutates `body` to coerce/clean string fields (trim, length cap, strip tags
 * AND escape angle brackets so any later HTML rendering stays safe even if a
 * downstream caller forgets to escape).
 *
 * Returns { ok: true } or { ok: false, errors: { field: message } }.
 */

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE  = /^\+?[0-9\s().\-]{6,20}$/;
const ISO_DATE  = /^\d{4}-\d{2}-\d{2}$/;

const MAX_LEN = {
  name: 100, email: 120, phone: 30, country: 60,
  tour: 120, bike: 80, notes: 1000,
};

const VALID_EXPERIENCE = ["beginner", "intermediate", "advanced", "expert"];
const VALID_TYPES      = ["guided", "rental"];

// Strip HTML tags then escape any remaining `<`, `>`, `&`, `"` so the value is
// safe to drop into HTML attributes/templates without an extra escape step.
function clean(str, max) {
  return String(str)
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidISODate(s) {
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return false;
  // Sanity bounds: not before today minus 1 year, not more than 3 years ahead.
  const now  = Date.now();
  const minT = now - 365 * 24 * 3600 * 1000;
  const maxT = now + 3 * 365 * 24 * 3600 * 1000;
  return d.getTime() >= minT && d.getTime() <= maxT;
}

function validateBooking(body) {
  const errors = {};
  if (!body || typeof body !== "object") {
    return { ok: false, errors: { _: "Invalid payload" } };
  }

  // Sanitise string fields up front so later checks see cleaned values.
  for (const [field, max] of Object.entries(MAX_LEN)) {
    if (body[field] != null && typeof body[field] === "string") {
      body[field] = clean(body[field], max);
    }
  }

  if (!body.name || body.name.length < 2)
    errors.name = "Full name is required (min 2 characters)";

  if (!body.email || !EMAIL_RE.test(body.email))
    errors.email = "Valid email address is required";
  if (body.email && body.email.length > MAX_LEN.email)
    errors.email = "Email is too long";

  if (body.phone && !PHONE_RE.test(body.phone))
    errors.phone = "Phone number format looks invalid";

  if (!body.tour || body.tour.length < 2)
    errors.tour = "Tour selection is required";

  if (!body.experience)
    errors.experience = "Riding experience level is required";
  else if (!VALID_EXPERIENCE.includes(body.experience))
    errors.experience = "Invalid experience level";

  if (body.type && !VALID_TYPES.includes(body.type))
    errors.type = "Invalid booking type";

  if (body.date && !isValidISODate(body.date))
    errors.date = "Date must be YYYY-MM-DD within a sensible range";
  if (body.date_to && !isValidISODate(body.date_to))
    errors.date_to = "End date must be YYYY-MM-DD within a sensible range";

  if (body.type === "rental") {
    if (!body.date)    errors.date    = errors.date    || "Start date is required for rentals";
    if (!body.date_to) errors.date_to = errors.date_to || "End date is required for rentals";
    if (body.date && body.date_to && body.date_to <= body.date)
      errors.date_to = "End date must be after start date";
  }

  if (body.rental_days != null) {
    const n = Number(body.rental_days);
    if (!Number.isInteger(n) || n < 1 || n > 365)
      errors.rental_days = "Rental days must be between 1 and 365";
    else
      body.rental_days = n;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

module.exports = { validateBooking };
