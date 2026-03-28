// Single source of truth shared by Home.jsx, Admin.jsx and Adventures.jsx
export const STORAGE_KEY = "moldovamoto_v2";
export const uid = () => Math.random().toString(36).slice(2, 9);

export const DEFAULT_IMGS = {
  r1: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  r2: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  r3: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
  fallback: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80",
};

const DIFFICULTY_TAG = { Easy: "Best Seller", Medium: "Most Popular", Hard: "Ultimate Experience" };

export const SEED = {
  routes: [
    {
      id: "r1", name: "1-Day Wine Ride", price: 220, days: 1,
      difficulty: "Easy", status: "active", dateType: "scheduled", capacity: 6,
      departures: [
        { id: "r1d1", date: "2026-04-04", maxSpots: 6 },
        { id: "r1d2", date: "2026-04-11", maxSpots: 6 },
        { id: "r1d3", date: "2026-04-18", maxSpots: 6 },
        { id: "r1d4", date: "2026-04-25", maxSpots: 6 },
        { id: "r1d5", date: "2026-05-02", maxSpots: 6 },
      ],
      stops: ["Cricova Wine Cellars", "Vineyard roads", "Winery lunch"],
      desc: "Cruise through sun-drenched vineyards and descend into the legendary Cricova wine cellars.",
      img: "",
    },
    {
      id: "r2", name: "3-Day Moldova Adventure", price: 650, days: 3,
      difficulty: "Medium", status: "active", visible: true, dateType: "scheduled", capacity: 8,
      departures: [
        { id: "r2d1", date: "2026-04-04", maxSpots: 8 },
        { id: "r2d2", date: "2026-04-18", maxSpots: 8 },
        { id: "r2d3", date: "2026-05-02", maxSpots: 8 },
        { id: "r2d4", date: "2026-05-16", maxSpots: 8 },
      ],
      stops: ["Orheiul Vechi Monastery", "Nistru River Route", "Village overnight stay"],
      desc: "Monasteries carved from limestone cliffs, winding river roads and authentic village hospitality.",
      img: "",
    },
    {
      id: "r3", name: "5-Day Grand Moldova Tour", price: 1050, days: 5,
      difficulty: "Hard", status: "active", dateType: "scheduled", capacity: 5,
      departures: [
        { id: "r3d1", date: "2026-04-10", maxSpots: 5 },
        { id: "r3d2", date: "2026-05-18", maxSpots: 5 },
        { id: "r3d3", date: "2026-06-15", maxSpots: 5 },
      ],
      stops: ["Full country traverse", "Saharna Monastery", "Belcresti Winery", "Bender Fortress"],
      desc: "The definitive Moldovan odyssey. North to south, village to vineyard, cliff monastery to Dniester canyon.",
      img: "",
    },
    {
      id: "r4", name: "Free Motorcycle Rental", price: 120, days: 1,
      difficulty: "Easy", status: "active", visible: true, dateType: "open", capacity: 4,
      departures: [],
      stops: [],
      desc: "Rent a CFMOTO 800MT Adventure and ride Moldova at your own pace. No guide, no fixed itinerary.",
      img: "",
    },
  ],
  bookings: [
    {
      id: "b1", type: "guided", tour: "3-Day Moldova Adventure", departureId: "r2d1",
      name: "Klaus Bauer", email: "k.bauer@mail.de", phone: "+49 170 5551234",
      country: "Germany", date: "2026-04-04", experience: "advanced",
      status: "confirmed", bike: "CFMOTO 800MT #1", createdAt: "2026-03-01",
    },
    {
      id: "b2", type: "guided", tour: "1-Day Wine Ride", departureId: "r1d2",
      name: "Sophie Laurent", email: "s.laurent@free.fr", phone: "+33 6 1234 5678",
      country: "France", date: "2026-04-11", experience: "intermediate",
      status: "pending", bike: "CFMOTO 800MT #2", createdAt: "2026-03-04",
    },
    {
      id: "b3", type: "guided", tour: "5-Day Grand Moldova Tour", departureId: "r3d1",
      name: "Marco Tessari", email: "m.tessari@tele.it", phone: "+39 347 8889001",
      country: "Italy", date: "2026-04-10", experience: "expert",
      status: "confirmed", bike: "CFMOTO 800MT #1", createdAt: "2026-03-06",
    },
  ],
  fleet: [
    {
      id: "f1", name: "CFMOTO 800MT #1", model: "CFMOTO 800MT Adventure", year: 2024,
      status: "available", odometer: 4200, lastService: "2026-02-15", color: "Storm Black",
      features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control"],
    },
    {
      id: "f2", name: "CFMOTO 800MT #2", model: "CFMOTO 800MT Adventure", year: 2024,
      status: "available", odometer: 6780, lastService: "2026-01-20", color: "Storm Black",
      features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control"],
    },
    {
      id: "f3", name: "CFMOTO 800MT #3", model: "CFMOTO 800MT Adventure", year: 2023,
      status: "maintenance", odometer: 14300, lastService: "2026-03-01", color: "Glacier White",
      features: ["ABS", "Traction Control", "Heated Grips"],
    },
    {
      id: "f4", name: "CFMOTO 800MT #4", model: "CFMOTO 800MT Adventure", year: 2024,
      status: "available", odometer: 2100, lastService: "2026-02-28", color: "Storm Black",
      features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control", "USB-C"],
    },
  ],
  gallery: [
    {
      id: "g1", type: "image", title: "Soroca Fortress at Sunset",
      tour: "5-Day Grand Moldova Tour", date: "2026-04-20",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
      featured: true, caption: "The iconic Soroca fortress glowing gold above the Dniester.",
    },
    {
      id: "g2", type: "image", title: "Cricova Underground Cellars",
      tour: "1-Day Wine Ride", date: "2026-04-11",
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
      featured: false, caption: "120 km of underground roads lined with millions of bottles.",
    },
    {
      id: "g3", type: "image", title: "Orheiul Vechi Canyon",
      tour: "3-Day Moldova Adventure", date: "2026-04-18",
      src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&q=80",
      featured: true, caption: "The Raut river meander carved into limestone - a natural amphitheatre.",
    },
    {
      id: "g4", type: "image", title: "Vineyard Roads",
      tour: "1-Day Wine Ride", date: "2026-04-11",
      src: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=900&q=80",
      featured: false, caption: "Empty roads threading through endless rows of vines.",
    },
  ],
};

export function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(SEED));
    const db = JSON.parse(raw);
    if (db.routes) {
      db.routes = db.routes.map(r => ({ dateType: "open", capacity: 8, departures: [], visible: true, ...r }));
    }
    if (!db.bookings) db.bookings = [];
    if (!db.fleet)    db.fleet    = JSON.parse(JSON.stringify(SEED.fleet));
    if (!db.gallery)  db.gallery  = JSON.parse(JSON.stringify(SEED.gallery));
    return db;
  } catch {
    return JSON.parse(JSON.stringify(SEED));
  }
}

export function saveDB(db) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch {}
}

export function spotsLeft(departure, bookings) {
  if (!departure) return 0;
  const used = (bookings || []).filter(
    b => b.departureId === departure.id && b.status === "confirmed"
  ).length;
  return Math.max(0, (departure.maxSpots || 0) - used);
}

export function routeToTour(r) {
  return {
    id:         r.id,
    title:      r.name,
    price:      "\u20ac" + Number(r.price).toLocaleString(),
    priceNum:   Number(r.price),
    duration:   r.days + " Day" + (r.days !== 1 ? "s" : ""),
    tag:        DIFFICULTY_TAG[r.difficulty] || r.difficulty,
    desc:       r.desc,
    img:        r.img || DEFAULT_IMGS[r.id] || DEFAULT_IMGS.fallback,
    highlights: (r.stops || []).slice(0, 4),
    dateType:   r.dateType   || "open",
    departures: r.departures || [],
    capacity:   r.capacity   || 8,
  };
}
