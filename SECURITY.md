# Security notes

## Recently fixed

- **Server: timing-safe admin key comparison** (`server/app.js`) — string equality replaced with `crypto.timingSafeEqual`, blocking timing side-channels.
- **Server: fail-fast on weak `API_ADMIN_KEY` in production** — the process refuses to start if the key is the dev default or shorter than 32 chars when `NODE_ENV=production`.
- **Server: required env vars validated at startup** (`server/index.js`) — `API_ADMIN_KEY` and `CORS_ORIGINS` must be set in production.
- **Server: CORS exact-match** — `startsWith` was vulnerable to `https://allowed.com.evil.com`. Now uses `Array.includes(origin)`.
- **Server: rate limits** — admin routes capped at 30 req/min, booking POST at 10/15min, browse endpoints at 100/15min. JSON body limit reduced from 50kb → 16kb.
- **Server: pagination cap** — admin booking list defaults to 50, max 100, with `Math.max` guards on offset.
- **Server: stronger validation** (`server/validate.js`) — proper email regex, phone format check, ISO date format with sensible bounds, rental_days range, per-field length caps. Sanitiser strips tags AND HTML-escapes residual entities.
- **Server: stronger booking ID** — `Math.random()` swapped for `crypto.randomBytes(8)`.
- **Server: graceful shutdown** — SIGTERM/SIGINT handlers let the SQLite flush complete before exit.
- **Frontend: HTML escaping in transactional emails** (`src/brevo.js`) — every user-controlled field (name, email, tour, phone, country, bike, experience, id) is now escaped before being interpolated into the email HTML or `mailto:` URL. Previously only the contact-form `message` was escaped.
- **Cleanup: removed dead `server/routes/bookings.js`** — duplicate of `server/app.js` routes, never mounted.

## Outstanding — needs follow-up work

### 1. Admin credentials shipped to the browser (CRITICAL)

`src/pages/Admin.jsx` reads `VITE_ADMIN_USER`, `VITE_ADMIN_PASS`, and `VITE_API_ADMIN_KEY` from `import.meta.env`. **Vite bakes every `VITE_*` variable into the production JS bundle.** Anyone who opens DevTools can read them, then call admin endpoints directly.

The current "login screen" only gates UI rendering — the API trusts whoever holds the admin key, and the key is in the bundle.

**Fix path (separate task):**
1. Add a real `POST /api/login` endpoint on the server that accepts username + password (compared with `bcrypt`), returns a short-lived JWT or opaque session token (HttpOnly cookie preferred).
2. Replace `adminAuth` to validate the token instead of a static `x-admin-key` header.
3. Delete `VITE_ADMIN_USER`, `VITE_ADMIN_PASS`, `VITE_API_ADMIN_KEY` from `.env` and the frontend bundle.
4. Add server-side per-IP failed-login throttling.

### 2. Brevo API key shipped to the browser (HIGH)

`src/brevo.js` calls Brevo directly using `VITE_BREVO_API_KEY`. Same problem as above — anyone can extract the key and send email/WhatsApp from your account.

**Fix path:** add `POST /api/notify-booking` and `POST /api/notify-contact` server endpoints; let the server hold the Brevo key and call Brevo. Remove all `VITE_BREVO_*` vars from the bundle.

### 3. CSP allows `'unsafe-inline'` for scripts (LOW)

`nginx.conf` keeps `script-src 'self' 'unsafe-inline'` because Vite's production build emits a small inline module-preload polyfill. Removing it without testing risks breaking the site. Long-term: switch to `vite-plugin-csp-guard` or move the polyfill to a hashed external file.

### 4. SQLite via `sql.js` flushes on the event loop (LOW)

`server/db.js` calls `fs.writeFileSync` after every write. Fine at low volume; a real load test will show latency spikes. Either switch to `better-sqlite3` (true sync C-extension SQLite) or debounce writes.

### 5. No CSRF protection (MEDIUM, mitigated by token-in-header)

Admin endpoints currently rely on `x-admin-key` in a custom header (which CSRF can't set without CORS). Once auth moves to cookies (issue #1), add a CSRF token or use `SameSite=Strict` cookies for admin routes.

### 6. No soft delete or audit trail on bookings (LOW)

`DELETE /api/bookings/:id` hard-deletes. Consider a `deleted_at` column and an admin-only "show deleted" view to prevent accidental data loss.
