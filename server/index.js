"use strict";
const db  = require("./db");
const app = require("./app");
const PORT = process.env.API_PORT || 4000;

db.dbReady.then(() => {
  app.listen(PORT, "0.0.0.0", () =>
    console.log("[MoldovaMoto API] listening on :" + PORT)
  );
}).catch(err => { console.error("[DB] Failed:", err); process.exit(1); });
