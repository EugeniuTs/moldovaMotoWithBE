// ─── Shared data layer ─────────────────────────────────────────
// Both Home.jsx and Admin.jsx read/write from this single key.
// Any change made in admin instantly appears on the public site
// on next load (or immediately if the storage event fires while
// both tabs are open).

export const STORAGE_KEY = "moldovamoto_v1";

export const uid = () => Math.random().toString(36).slice(2, 9);

// Default images per seed route id (used when admin hasn't uploaded one)
export const DEFAULT_IMGS = {
  r1: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  r2: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  r3: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
  fallback: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80",
};

// ── Seed data (written to localStorage only once on first visit) ──
export const SEED = {
  routes: [
    {
      id: "r1", name: "1-Day Wine Ride", price: 220, days: 1,
      difficulty: "Easy", status: "active",
      stops: ["Cricova Wine Cellars", "Vineyard roads", "Winery lunch"],
      desc: "Cruise through sun-drenched vineyards and descend into the legendary Cricova wine cellars. A perfect taste of Moldovan soul.",
      img: "",
    },
    {
      id: "r2", name: "3-Day Moldova Adventure", price: 650, days: 3,
      difficulty: "Medium", status: "active",
      stops: ["Orheiul Vechi Monastery", "Nistru River Route", "Village overnight stay"],
      desc: "Monasteries carved from limestone cliffs, winding river roads and authentic village hospitality. The real Moldova unfolds.",
      img: "",
    },
    {
      id: "r3", name: "5-Day Grand Moldova Tour", price: 1050, days: 5,
      difficulty: "Hard", status: "active",
      stops: ["Full country traverse", "Saharna Monastery", "Belcresti Winery", "Bender Fortress"],
      desc: "The definitive Moldovan odyssey. North to south, village to vineyard, cliff monastery to Dniester canyon — all on two wheels.",
      img: "",
    },
  ],
  bookings: [
    { id: "b1", tour: "3-Day Moldova Adventure",  name: "Klaus Bauer",    email: "k.bauer@mail.de",   phone: "+49 170 5551234", country: "Germany", date: "2025-06-06", experience: "advanced",     status: "confirmed", bike: "CFMOTO 800MT #1", createdAt: "2025-03-01" },
    { id: "b2", tour: "1-Day Wine Ride",           name: "Sophie Laurent", email: "s.laurent@free.fr", phone: "+33 6 1234 5678", country: "France",  date: "2025-06-13", experience: "intermediate", status: "pending",   bike: "CFMOTO 800MT #2", createdAt: "2025-03-04" },
    { id: "b3", tour: "5-Day Grand Moldova Tour",  name: "Marco Tessari",  email: "m.tessari@tele.it", phone: "+39 347 8889001", country: "Italy",   date: "2025-06-20", experience: "expert",       status: "confirmed", bike: "CFMOTO 800MT #1", createdAt: "2025-03-06" },
  ],
  fleet: [
    { id: "f1", name: "CFMOTO 800MT #1", model: "CFMOTO 800MT Adventure", year: 2024, status: "available",   odometer: 4200,  lastService: "2025-02-15", color: "Storm Black",   features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control"] },
    { id: "f2", name: "CFMOTO 800MT #2", model: "CFMOTO 800MT Adventure", year: 2024, status: "in-use",      odometer: 6780,  lastService: "2025-01-20", color: "Storm Black",   features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control"] },
    { id: "f3", name: "CFMOTO 800MT #3", model: "CFMOTO 800MT Adventure", year: 2023, status: "maintenance", odometer: 14300, lastService: "2025-03-01", color: "Glacier White", features: ["ABS", "Traction Control", "Heated Grips"] },
    { id: "f4", name: "CFMOTO 800MT #4", model: "CFMOTO 800MT Adventure", year: 2024, status: "available",   odometer: 2100,  lastService: "2025-02-28", color: "Storm Black",   features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control", "USB-C"] },
  ],
};

// ── Read ──────────────────────────────────────────────────────────
export function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED));
  } catch {
    return JSON.parse(JSON.stringify(SEED));
  }
}

// ── Write ─────────────────────────────────────────────────────────
export function saveDB(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch { /* quota exceeded or private mode */ }
}

// ── Convert an admin route record → shape expected by Home.jsx UI ──
const DIFFICULTY_TAG = { Easy: "Best Seller", Medium: "Most Popular", Hard: "Ultimate Experience" };

export function routeToTour(r, index) {
  return {
    id:         r.id,
    title:      r.name,
    price:      `€${Number(r.price).toLocaleString()}`,
    priceNum:   Number(r.price),
    duration:   `${r.days} Day${r.days !== 1 ? "s" : ""}`,
    tag:        DIFFICULTY_TAG[r.difficulty] || r.difficulty,
    desc:       r.desc,
    img:        r.img || DEFAULT_IMGS[r.id] || DEFAULT_IMGS.fallback,
    highlights: (r.stops || []).slice(0, 4),
  };
}
