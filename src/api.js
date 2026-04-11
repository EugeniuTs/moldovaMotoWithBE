/**
 * api.js — Frontend API client for the MoldovaMoto backend
 *
 * All booking data flows through this module.
 */

const API_BASE = import.meta.env.VITE_API_URL || "/api";

/** POST a new booking — called by the public booking form */
export async function createBooking(bookingData) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(bookingData),
  });

  const data = await res.json();

  if (!res.ok) {
    // 422 = validation errors, 409 = bike conflict
    const err = new Error(data.errors
      ? Object.values(data.errors).join(". ")
      : data.error || "Booking failed — please try again.");
    err.status = res.status;
    err.errors = data.errors || {};
    throw err;
  }

  return data; // { success, booking_id, status, message, booking }
}

/** Fetch all bookings — admin panel */
export async function fetchBookings(params = {}, adminKey = "") {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();

  const res = await fetch(`${API_BASE}/bookings${qs ? "?" + qs : ""}`, {
    headers: { "x-admin-key": adminKey },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch bookings");
  return data; // { success, total, bookings }
}

/** Fetch single booking */
export async function fetchBooking(id, adminKey = "") {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    headers: { "x-admin-key": adminKey },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Booking not found");
  return data.booking;
}

/** Update booking (admin) */
export async function updateBooking(id, updates, adminKey = "") {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
    body:    JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Update failed");
  return data.booking;
}

/** Delete booking (admin) */
export async function deleteBooking(id, adminKey = "") {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method:  "DELETE",
    headers: { "x-admin-key": adminKey },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Delete failed");
  return data;
}

/** API health check */
export async function healthCheck() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
