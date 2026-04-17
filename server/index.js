"use strict";
const db  = require("./db");
const PORT = Number(process.env.API_PORT) || 4000;

// Fail fast on missing/insecure config in production. Catching this here means
// a misconfigured deploy refuses to start instead of silently running with
// dev defaults that expose the admin API.
if (process.env.NODE_ENV === "production") {
  const missing = [];
  if (!process.env.API_ADMIN_KEY)  missing.push("API_ADMIN_KEY");
  if (!process.env.CORS_ORIGINS)   missing.push("CORS_ORIGINS");
  if (missing.length) {
    console.error("[FATAL] Missing required env vars in production:", missing.join(", "));
    process.exit(1);
  }
}

const app = require("./app");

const server = db.dbReady.then(() => {
  return app.listen(PORT, "0.0.0.0", () =>
    console.log("[MoldovaMoto API] listening on :" + PORT)
  );
}).catch(err => { console.error("[DB] Failed:", err); process.exit(1); });

// Graceful shutdown — important when running under Docker/systemd so the DB
// flush completes before the process is killed.
function shutdown(signal) {
  console.log(`[MoldovaMoto API] ${signal} received, shutting down...`);
  server.then(s => s && s.close(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
