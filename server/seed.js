"use strict";
/**
 * seed.js — default content for first-time server startup.
 * Mirrors SEED in src/store.js for routes / fleet / gallery so that the
 * server is authoritative after first boot.
 */
module.exports = {
  routes: [
    {
      id: "r1", name: "1-Day Wine Ride", price: 220, days: 1,
      difficulty: "Easy", status: "active", visible: true, dateType: "scheduled", capacity: 6,
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
      difficulty: "Hard", status: "active", visible: true, dateType: "scheduled", capacity: 5,
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
  fleet: [
    { id: "f1", name: "CFMOTO 800MT #1", model: "CFMOTO 800MT Adventure", year: 2024,
      status: "available",   odometer: 4200,  lastService: "2026-02-15", color: "Storm Black",
      features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control"] },
    { id: "f2", name: "CFMOTO 800MT #2", model: "CFMOTO 800MT Adventure", year: 2024,
      status: "available",   odometer: 6780,  lastService: "2026-01-20", color: "Storm Black",
      features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control"] },
    { id: "f3", name: "CFMOTO 800MT #3", model: "CFMOTO 800MT Adventure", year: 2023,
      status: "maintenance", odometer: 14300, lastService: "2026-03-01", color: "Glacier White",
      features: ["ABS", "Traction Control", "Heated Grips"] },
    { id: "f4", name: "CFMOTO 800MT #4", model: "CFMOTO 800MT Adventure", year: 2024,
      status: "available",   odometer: 2100,  lastService: "2026-02-28", color: "Storm Black",
      features: ["ABS", "Traction Control", "Heated Grips", "Cruise Control", "USB-C"] },
  ],
  gallery: [
    { id: "g1", type: "image", title: "Soroca Fortress at Sunset",
      tour: "5-Day Grand Moldova Tour", date: "2026-04-20",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
      featured: true,  caption: "The iconic Soroca fortress glowing gold above the Dniester." },
    { id: "g2", type: "image", title: "Cricova Underground Cellars",
      tour: "1-Day Wine Ride", date: "2026-04-11",
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
      featured: false, caption: "120 km of underground roads lined with millions of bottles." },
    { id: "g3", type: "image", title: "Orheiul Vechi Canyon",
      tour: "3-Day Moldova Adventure", date: "2026-04-18",
      src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&q=80",
      featured: true,  caption: "The Raut river meander carved into limestone - a natural amphitheatre." },
    { id: "g4", type: "image", title: "Vineyard Roads",
      tour: "1-Day Wine Ride", date: "2026-04-11",
      src: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=900&q=80",
      featured: false, caption: "Empty roads threading through endless rows of vines." },
  ],
};
