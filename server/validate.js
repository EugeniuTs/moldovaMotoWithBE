"use strict";

/**
 * Validate a booking payload.
 * Returns { ok: true } or { ok: false, errors: { field: message } }
 */
function validateBooking(body) {
  const errors = {};

  if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2)
    errors.name = "Full name is required (min 2 characters)";

  if (!body.email || typeof body.email !== "string" || !body.email.includes("@"))
    errors.email = "Valid email address is required";

  if (!body.tour || typeof body.tour !== "string" || body.tour.trim().length < 2)
    errors.tour = "Tour selection is required";

  if (!body.experience)
    errors.experience = "Riding experience level is required";

  const validExperience = ["beginner", "intermediate", "advanced", "expert"];
  if (body.experience && !validExperience.includes(body.experience))
    errors.experience = "Invalid experience level";

  const validTypes = ["guided", "rental"];
  if (body.type && !validTypes.includes(body.type))
    errors.type = "Invalid booking type";

  // Date validation for open/rental bookings
  if (body.type === "rental") {
    if (!body.date) errors.date = "Start date is required for rentals";
    if (!body.date_to) errors.date_to = "End date is required for rentals";
    if (body.date && body.date_to && body.date_to <= body.date)
      errors.date_to = "End date must be after start date";
  }

  // Basic XSS sanitisation — strip HTML tags from string fields
  const stringFields = ["name", "email", "phone", "country", "tour", "bike", "notes"];
  stringFields.forEach(f => {
    if (body[f] && typeof body[f] === "string")
      body[f] = body[f].replace(/<[^>]*>/g, "").trim().slice(0, 500);
  });

  return { ok: Object.keys(errors).length === 0, errors };
}

module.exports = { validateBooking };
