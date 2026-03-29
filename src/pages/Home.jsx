import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { loadDB, saveDB, routeToTour, uid, STORAGE_KEY, spotsLeft } from "../store.js";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;900&family=Lora:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Archivo', sans-serif; background: #0f0f0f; color: #f4f4f4; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #1a1a1a; }
  ::-webkit-scrollbar-thumb { background: #ff6b00; border-radius: 3px; }
  input, select, textarea { font-family: 'Archivo', sans-serif; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,107,0,0.5); } 50% { box-shadow: 0 0 0 12px rgba(255,107,0,0); } }
  @keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .hero-animate { animation: fadeUp 0.9s ease both; }
  .hero-animate-2 { animation: fadeUp 0.9s 0.2s ease both; }
  .hero-animate-3 { animation: fadeUp 0.9s 0.4s ease both; }
  .hero-animate-4 { animation: fadeUp 0.9s 0.6s ease both; }
  .cta-pulse { animation: pulse 2.5s infinite; }
  .booking-slide { animation: slideIn 0.35s ease both; }
  .nav-link { position: relative; color: #ccc; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.2s; }
  .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #ff6b00; transition: width 0.25s; }
  .nav-link:hover { color: #fff; }
  .nav-link:hover::after { width: 100%; }
  .tour-card:hover .tour-card-img { transform: scale(1.07); }
  .tour-card:hover { transform: translateY(-6px); }
  .feature-icon-wrap:hover { background: #ff6b00; transform: scale(1.08); }
  .feature-icon-wrap:hover svg { color: #fff; }
  .testimonial-star { color: #ff6b00; font-size: 16px; }
  .step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; transition: all 0.3s; }
  .step-dot.active { background: #ff6b00; color: #fff; }
  .step-dot.done { background: #ff6b00; color: #fff; }
  .step-dot.inactive { background: #2a2a2a; color: #666; border: 1.5px solid #333; }
  .form-input { width: 100%; background: #1a1a1a; border: 1.5px solid #2e2e2e; border-radius: 8px; padding: 12px 16px; color: #f4f4f4; font-size: 15px; transition: border-color 0.2s; outline: none; }
  .form-input:focus { border-color: #ff6b00; }
  .form-input option { background: #1a1a1a; }
  .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23ff6b00' d='M0 0l6 8 6-8z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }
  .map-stop { transition: all 0.2s; cursor: pointer; }
  .map-stop:hover circle { r: 9; fill: #ff6b00; }
  .map-stop:hover text { font-weight: 700; fill: #ff6b00; }
  .overlay-gradient { background: linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.32) 55%, rgba(0,0,0,0.08) 100%); }
  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .nav-book-btn { display: none !important; }
    .hamburger { display: flex !important; flex-direction: column; }
    .hero-title { font-size: clamp(32px, 9vw, 64px) !important; }
    .hero-sub { font-size: 15px !important; }
    .hero-stats { gap: 20px !important; }
    .tours-grid { grid-template-columns: 1fr !important; }
    .exp-grid { grid-template-columns: 1fr 1fr !important; }
    .fleet-inner { flex-direction: column !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
    .steps-bar { gap: 4px !important; }
    .step-label { display: none !important; }
    .map-grid { grid-template-columns: 1fr !important; }
    .booking-modal-inner { padding: 20px 16px !important; }
  }
  @media (max-width: 480px) {
    .exp-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
    .hero-stats { flex-wrap: wrap !important; gap: 16px !important; }
  }
  .hamburger { display: none; align-items: center; justify-content: center;
    width: 40px; height: 40px; background: transparent; border: 1.5px solid rgba(255,255,255,0.2);
    border-radius: 8px; cursor: pointer; flex-direction: column; gap: 5px; padding: 0; }
  .hamburger span { display: block; width: 18px; height: 2px; background: #f4f4f4;
    border-radius: 2px; transition: all 0.3s; }
  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .mobile-menu { display: none; position: absolute; top: 100%; left: 0; right: 0;
    background: rgba(10,10,11,0.98); backdrop-filter: blur(16px);
    border-bottom: 1px solid #252525; padding: 16px 0 20px; flex-direction: column; }
  .mobile-menu.open { display: flex; }
  .mobile-menu a { padding: 13px 24px; font-size: 15px; font-weight: 700;
    color: #ccc; text-decoration: none; letter-spacing: 0.06em; text-transform: uppercase;
    border-bottom: 1px solid #1a1a1a; transition: color 0.2s; }
  .mobile-menu a:hover { color: #ff6b00; }
  .mobile-menu a.orange { color: #ff6b00; }
  .mobile-menu-book { margin: 14px 24px 0; background: #ff6b00; color: #fff;
    border: none; border-radius: 10px; padding: 14px; font-size: 15px; font-weight: 800;
    cursor: pointer; font-family: inherit; letter-spacing: 0.04em; text-align: center; }
`;

const ORANGE = "#ff6b00";
const DARK = "#0f0f0f";
const CARD = "#141414";
const SURFACE = "#1a1a1a";
const BORDER = "#252525";
const WHITE = "#f4f4f4";
const MUTED = "#888";

// --- SVG Icons ---
const IconBike = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9.5"/>
    <path d="M12 2.5C12 2.5 9 6.5 9 12s3 9.5 3 9.5M12 2.5C12 2.5 15 6.5 15 12s-3 9.5-3 9.5" strokeLinecap="round"/>
    <line x1="2.5" y1="12" x2="21.5" y2="12"/>
    <path d="M4 7.5h16M4 16.5h16" strokeOpacity="0.5"/>
    <path d="M17.5 6 L15 11 L20 9.5 Z" fill="currentColor" stroke="none"/>
  </svg>
);
const IconGuide = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="3.8" strokeLinecap="round"/>
    <path d="M4 20.5v-1.2C4 16 7.6 14 12 14s8 2 8 5.3v1.2" strokeLinecap="round"/>
  </svg>
);
const IconMoto = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <circle cx="6" cy="16" r="3.8"/>
    <circle cx="18" cy="16" r="3.8"/>
    <path d="M6 16 L11 9 L18 16" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 9 L14 9" strokeLinecap="round"/>
    <circle cx="12.5" cy="9" r="0" stroke="none"/>
  </svg>
);
const IconRoute = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
    <path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 13 6 13s6-8 6-13c0-3.3-2.7-6-6-6z" strokeLinejoin="round"/>
    <circle cx="12" cy="8" r="2.2" strokeWidth="1.5"/>
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" fill="none" stroke={ORANGE} strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrow = ({ dir = "right" }) => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
    style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconClose = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconWA = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.47 14.38c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.07a7.4 7.4 0 01-2.18-1.35 8.19 8.19 0 01-1.51-1.88c-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.83-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.97 2.63 1.1 2.81c.14.18 1.9 2.9 4.61 4.07.64.28 1.14.44 1.53.56.64.2 1.23.17 1.69.1.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.09-1.35A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
  </svg>
);
const IconIG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);

// --- DATA ---
// tours, fleet are loaded live from localStorage (shared with admin).
// Static fallbacks used only if store is empty.

const features = [
  { icon: <IconBike />, title: "Adventure Riding", desc: "Tackle Moldova's secret backroads, limestone ridges, and river canyon passes — routes you won't find on any travel blog." },
  { icon: <IconGuide />, title: "Local Expert Guide", desc: "Your guide is a native Moldovan rider who knows every shortcut, every hidden winery, and every story behind the ruins." },
  { icon: <IconMoto />, title: "Premium Motorcycles", desc: "Ride the CFMOTO 800MT — a touring-class adventure bike with ABS, traction control, and heated grips for total comfort." },
  { icon: <IconRoute />, title: "Unique Routes", desc: "Every itinerary is handcrafted. Avoid tourist trails entirely and discover the Moldova that 99% of visitors never see." }
];

const testimonials = [
  { name: "Klaus B.", country: "Germany 🇩🇪", text: "One of the best motorcycle tours in all of Europe. The Orheiul Vechi section at sunset was absolutely breathtaking. Already planning to return for the 5-day tour.", stars: 5 },
  { name: "Sophie L.", country: "France 🇫🇷", text: "I was skeptical about Moldova, but this experience completely changed my view of Eastern Europe. The CFMOTO handled the roads perfectly, and our guide was outstanding.", stars: 5 },
  { name: "Marco T.", country: "Italy 🇮🇹", text: "Excellent organisation, premium bike, genuine local experiences. The Cricova wine cellar visit was surreal — 120km of underground wine roads. Unforgettable.", stars: 5 }
];

const fleetFeatures = [
  "ABS & Cornering Traction Control",
  "Heated Grips & Seat",
  "Full Touring Windshield",
  "35L Panniers + Top Box",
  "5\" TFT Connected Display",
  "Cruise Control",
  "LED Adventure Lighting",
  "USB-C Charging Port"
];

// Coordinates derived from real lat/lon:
// x = 20 + (lon − 26.62) × 74.07  |  y = 390 − (lat − 45.47) × 124.17
// ViewBox: 0 0 300 420
const mapStops = [
  { lat: 47.0056,  lng: 28.8575, name: "Chișinău",     label: "Capital City",              sub: "Tour Start / End",
    desc: "Your tour begins in Moldova's vibrant capital. Pick up your CFMOTO 800MT, meet your guide, and ride out." },
  { lat: 47.3644,  lng: 28.9767, name: "Orheiul Vechi", label: "Cliff Monastery",           sub: "★ Unmissable",
    desc: "A 6th-century monastery carved into limestone cliffs above the Răut River — one of Europe's most dramatic natural amphitheatres." },
  { lat: 47.1361,  lng: 28.8594, name: "Cricova",       label: "Underground Wine City",     sub: "1-Day Tour",
    desc: "120 km of underground galleries turned wine cellar. The Soviet-era labyrinth holds millions of bottles beneath rolling vineyards." },
  { lat: 47.8611,  lng: 28.9750, name: "Saharna",       label: "Nistru Canyon & Monastery", sub: "3 & 5-Day Tour",
    desc: "An 18th-century monastery tucked above a dramatic Dniester canyon waterfall. Remote, pristine, and completely unforgettable." },
  { lat: 48.1569,  lng: 28.2886, name: "Soroca",        label: "Medieval Fortress",         sub: "5-Day Tour",
    desc: "Moldova's perfectly preserved 16th-century Genoese-Ottoman fortress, sitting on the Dniester riverbank at the Ukrainian border." },
  { lat: 46.8264,  lng: 29.4847, name: "Bender",        label: "Ottoman Fortress",          sub: "5-Day Tour",
    desc: "A massive 16th-century Ottoman citadel commanding the Dniester with centuries of turbulent history etched into every stone bastion." }
];

// ============================================================
// BOOKING MODAL
// ============================================================
const STEP_LABELS = ["Tour", "Date", "Bike", "Rider Info", "Confirm"];

function BookingModal({ onClose, defaultTour = "", tours = [], fleet = [], allBookings = [] }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    tour: defaultTour, date: "", dateTo: "", departureId: "", bike: "", rentalDays: 1,
    name: "", email: "", phone: "", country: "", experience: "",
    license: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    // Auto-compute rental days when either date changes
    if ((k === "date" || k === "dateTo") && next.date && next.dateTo) {
      const ms = new Date(next.dateTo) - new Date(next.date);
      const days = Math.max(1, Math.round(ms / 86400000));
      next.rentalDays = days;
    }
    return next;
  });

  const validate = () => {
    const e = {};
    if (step === 0 && !form.tour) e.tour = "Please select a tour";
    if (step === 1) {
      if (isOpenDate && !form.date) e.date = "Please pick a start date";
      if (isOpenDate && !form.dateTo) e.dateTo = "Please pick an end date";
      if (isOpenDate && form.date && form.dateTo && form.dateTo <= form.date) e.dateTo = "End date must be after start date";
      if (!isOpenDate && !form.departureId) e.date = "Please select a departure date";
    }
    if (step === 3) {
      if (!form.name) e.name = "Name required";
      if (!form.email || !form.email.includes("@")) e.email = "Valid email required";
      if (!form.phone) e.phone = "Phone required";
      if (!form.country) e.country = "Country required";
      if (!form.experience) e.experience = "Please select experience level";
    }
    if (step === 4 && !form.license) e.license = "Please confirm your license";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 4)); };
  const prev = () => { setStep(s => Math.max(s - 1, 0)); setErrors({}); };
  const submit = () => {
    if (!validate()) return;
    // Persist booking to shared store so admin sees it immediately
    const db = loadDB();
    const availableBike = fleet.find(b => b.status === "available");
    const depObj = selectedTour && form.departureId
      ? (selectedTour.departures||[]).find(d=>d.id===form.departureId)
      : null;
    const newBooking = {
      id: "b" + uid(),
      type: selectedTour?.dateType === "open" ? "rental" : "guided",
      tour: form.tour,
      departureId: form.departureId || "",
      name: form.name,
      email: form.email,
      phone: form.phone,
      country: form.country,
      date: depObj ? depObj.date : form.date,
      dateTo: isOpenDate ? form.dateTo : undefined,
      rentalDays: isOpenDate ? (form.rentalDays || 1) : undefined,
      experience: form.experience,
      status: "pending",
      bike: form.bike || (availableBike ? availableBike.name : "CFMOTO 800MT"),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    saveDB({ ...db, bookings: [...db.bookings, newBooking] });
    setSubmitted(true);
  };

  const today = new Date().toISOString().split("T")[0];
  const selectedTour = tours.find(t => t.title === form.tour) || null;
  const isOpenDate   = !selectedTour || selectedTour.dateType === "open";

  // Returns true if a bike has no confirmed/pending booking overlapping the selected dates
  const bikeAvailable = (bike) => {
    if (bike.status !== "available") return false;
    // Determine the dates this booking would occupy
    const from = isOpenDate ? form.date : (() => {
      const dep = (selectedTour?.departures || []).find(d => d.id === form.departureId);
      return dep ? dep.date : null;
    })();
    const to   = isOpenDate ? (form.dateTo || form.date) : from;
    if (!from) return true; // no date chosen yet — show all available
    // Check all bookings that use this bike and have overlapping dates
    return !allBookings.some(b => {
      if (b.bike !== bike.name) return false;
      if (b.status === "cancelled") return false;
      const bFrom = b.date || "";
      const bTo   = b.dateTo || b.date || "";
      if (!bFrom) return false;
      // Overlap: bFrom <= to AND bTo >= from
      return bFrom <= to && bTo >= from;
    });
  };
  const departures   = selectedTour ? (selectedTour.departures || []).filter(d => d.date >= today) : [];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} />
      <div className="booking-slide" style={{
        position: "relative", width: "100%", maxWidth: 580, background: "#111",
        border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden", maxHeight: "90vh", overflowY: "auto"
      }}>
        {/* Header */}
        <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: ORANGE, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Reservation Request</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: WHITE }}>Book Your Tour</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 4 }}><IconClose /></button>
        </div>

        {!submitted ? (
          <>
            {/* Step indicator */}
            <div className="steps-bar" style={{ display: "flex", alignItems: "center", padding: "20px 28px 0", gap: 8 }}>
              {STEP_LABELS.map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 4 ? 1 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div className={`step-dot ${i < step ? "done" : i === step ? "active" : "inactive"}`}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span className="step-label" style={{ fontSize: 10, color: i === step ? ORANGE : MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{label}</span>
                  </div>
                  {i < 4 && <div style={{ flex: 1, height: 1.5, background: i < step ? ORANGE : BORDER, margin: "0 6px", marginBottom: 22, borderRadius: 1 }} />}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div style={{ padding: "24px 28px 28px" }}>

              {step === 0 && (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 16 }}>Which tour calls to you?</div>
                  {tours.length === 0 && (
                    <div style={{ color: MUTED, fontSize: 14, padding: "20px 0" }}>No active tours available right now.</div>
                  )}
                  {tours.map(t => {
                    const sel = form.tour === t.title;
                    return (
                      <div key={t.id} onClick={() => set("tour", t.title)}
                        style={{
                          border: `1.5px solid ${sel ? ORANGE : BORDER}`,
                          borderRadius: 14, marginBottom: 10, cursor: "pointer",
                          background: sel ? "rgba(255,107,0,0.07)" : "#161616",
                          overflow: "hidden", transition: "all 0.2s",
                          boxShadow: sel ? `0 0 0 1px ${ORANGE}` : "none"
                        }}>
                        <div style={{ display: "flex", alignItems: "stretch", minHeight: 76 }}>
                          {/* Thumbnail */}
                          <div style={{
                            width: 110, flexShrink: 0, position: "relative", overflow: "hidden",
                            background: "#0e0e0e"
                          }}>
                            {t.img
                              ? <img src={t.img} alt={t.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover",
                                    transition: "transform 0.4s", transform: sel ? "scale(1.06)" : "scale(1)" }} />
                              : <div style={{ width: "100%", height: "100%", display: "flex",
                                  alignItems: "center", justifyContent: "center", fontSize: 28, opacity: 0.18 }}>🏍️</div>
                            }
                            {/* gradient overlay so text stays readable */}
                            <div style={{ position: "absolute", inset: 0,
                              background: "linear-gradient(to right, rgba(0,0,0,0) 60%, rgba(22,22,22,0.85))" }} />
                          </div>
                          {/* Text content */}
                          <div style={{ flex: 1, padding: "14px 16px", display: "flex",
                            alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 800, color: sel ? WHITE : "#ddd",
                                fontSize: 15, marginBottom: 3, lineHeight: 1.2 }}>{t.title}</div>
                              <div style={{ fontSize: 12, color: MUTED }}>{t.duration}</div>
                              {t.highlights && t.highlights.length > 0 && (
                                <div style={{ fontSize: 11, color: sel ? "rgba(255,107,0,0.75)" : "#555",
                                  marginTop: 4, whiteSpace: "nowrap", overflow: "hidden",
                                  textOverflow: "ellipsis", maxWidth: 200 }}>
                                  {t.highlights.slice(0,2).join(" · ")}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 20, fontWeight: 900, color: ORANGE,
                                lineHeight: 1 }}>{t.price}</div>
                              {sel && (
                                <div style={{ marginTop: 6, background: ORANGE, color: "#fff",
                                  borderRadius: 6, padding: "2px 8px", fontSize: 10,
                                  fontWeight: 800, letterSpacing: "0.06em" }}>SELECTED</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {errors.tour && <div style={{ color: "#ff4d4d", fontSize: 13, marginTop: 4 }}>{errors.tour}</div>}
                </div>
              )}

              {step === 1 && (
                <div>
                  {isOpenDate ? (
                    /* ── Free rental: from → to date range ── */
                    <>
                      <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 6 }}>Choose your rental period</div>
                      <div style={{ fontSize: 14, color: MUTED, marginBottom: 20 }}>Select a start and end date — your bike is reserved for the entire period.</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>From</label>
                          <input type="date" className="form-input" min={today} value={form.date}
                            onChange={e => {
                              set("date", e.target.value);
                              if (form.dateTo && form.dateTo <= e.target.value) set("dateTo", "");
                            }}
                            style={{ fontSize: 14, colorScheme: "dark" }} />
                          {errors.date && <div style={{ color: "#ff4d4d", fontSize: 12, marginTop: 4 }}>{errors.date}</div>}
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>To</label>
                          <input type="date" className="form-input"
                            min={form.date || today}
                            value={form.dateTo}
                            onChange={e => set("dateTo", e.target.value)}
                            style={{ fontSize: 14, colorScheme: "dark" }} />
                          {errors.dateTo && <div style={{ color: "#ff4d4d", fontSize: 12, marginTop: 4 }}>{errors.dateTo}</div>}
                        </div>
                      </div>
                      {form.date && form.dateTo && form.dateTo > form.date && (
                        <div style={{ padding: "13px 16px", background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.25)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: "#ffb27a" }}>
                            {form.rentalDays} day{form.rentalDays !== 1 ? "s" : ""} · {form.date} → {form.dateTo}
                          </span>
                          <span style={{ fontSize: 15, fontWeight: 800, color: ORANGE }}>
                            €{((selectedTour?.priceNum || 0) * form.rentalDays).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* ── Scheduled tour: predefined departure slots ── */
                    <>
                      <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 6 }}>Select a departure date</div>
                      <div style={{ fontSize: 14, color: MUTED, marginBottom: 20 }}>
                        {departures.length} upcoming departure{departures.length !== 1 ? "s" : ""} — spots decrease as bookings are confirmed.
                      </div>
                      {departures.length === 0 && (
                        <div style={{ color: MUTED, fontSize: 13, padding: "20px 0" }}>No upcoming departures scheduled yet. Contact us to arrange a custom date.</div>
                      )}
                      {departures.sort((a, b) => a.date.localeCompare(b.date)).map(dep => {
                        const confirmed = allBookings.filter(b => b.departureId === dep.id && b.status === "confirmed").length;
                        const left = Math.max(0, (dep.maxSpots || 0) - confirmed);
                        const isFull = left === 0;
                        const sel    = form.departureId === dep.id;
                        return (
                          <div key={dep.id}
                            onClick={() => { if (!isFull) { set("departureId", dep.id); set("date", dep.date); } }}
                            style={{
                              border: `1.5px solid ${sel ? ORANGE : isFull ? "#333" : BORDER}`,
                              borderRadius: 12, padding: "14px 18px", marginBottom: 10,
                              cursor: isFull ? "not-allowed" : "pointer",
                              background: sel ? "rgba(255,107,0,0.08)" : "#161616",
                              opacity: isFull ? 0.5 : 1,
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              transition: "all 0.2s"
                            }}>
                            <div>
                              <div style={{ fontWeight: 700, color: isFull ? MUTED : WHITE }}>
                                {new Date(dep.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                              </div>
                              <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
                                {selectedTour?.duration} · departs Chișinău
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: isFull ? "#555" : left <= 2 ? "#eab308" : "#22c55e" }}>
                                {isFull ? "FULL" : `${left} spot${left !== 1 ? "s" : ""} left`}
                              </div>
                              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>of {dep.maxSpots}</div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  {errors.date && <div style={{ color: "#ff4d4d", fontSize: 13, marginTop: 8 }}>{errors.date}</div>}
                </div>
              )}

              {step === 2 && (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 6 }}>Choose Your Ride</div>
                  <div style={{ fontSize: 14, color: MUTED, marginBottom: 16 }}>
                    {form.date ? "Showing bikes available for your selected dates." : "Select an available motorcycle from our fleet."}
                  </div>
                  {fleet.filter(bikeAvailable).length === 0 && (
                    <div style={{ padding: "20px 16px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, fontSize: 13, color: "#fca5a5" }}>
                      No bikes available for your selected dates — all are booked. Please try different dates or contact us directly.
                    </div>
                  )}
                  {fleet.map(bike => {
                    const avail = bikeAvailable(bike);
                    const conflicts = !avail ? allBookings.filter(b =>
                      b.bike === bike.name && b.status !== "cancelled" &&
                      (b.dateTo||b.date||"") >= (isOpenDate?form.date:(selectedTour?.departures||[]).find(d=>d.id===form.departureId)?.date||"") &&
                      (b.date||"") <= (isOpenDate?(form.dateTo||form.date):(selectedTour?.departures||[]).find(d=>d.id===form.departureId)?.date||"")
                    ) : [];
                    if (!avail && bike.status !== "available") return null; // hide maintenance bikes
                    return (
                    <div key={bike.id}
                      onClick={() => avail && set("bike", bike.name)}
                      style={{
                        border: `2px solid ${!avail ? "rgba(239,68,68,0.25)" : form.bike === bike.name ? ORANGE : BORDER}`,
                        borderRadius: 14, overflow: "hidden",
                        background: !avail ? "rgba(239,68,68,0.04)" : "#161616",
                        marginBottom: 12, cursor: avail ? "pointer" : "not-allowed",
                        opacity: avail ? 1 : 0.6, transition: "border-color 0.2s, opacity 0.2s"
                      }}>
                      <div style={{ padding: "16px 20px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <div style={{ background: avail ? ORANGE : "#7f1d1d", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                            {avail ? "Available" : "Booked"}
                          </div>
                          <div style={{ fontSize: 17, fontWeight: 900, color: WHITE }}>{bike.name}</div>
                          <div style={{ fontSize: 12, color: MUTED, marginLeft: "auto" }}>{bike.color} · {bike.year}</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                          {(bike.features || []).slice(0, 6).map((f, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#ccc" }}>
                              <IconCheck />{f}
                            </div>
                          ))}
                        </div>
                          {!avail && conflicts.length > 0 && (
                            <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 6 }}>
                              Booked {conflicts[0].date}{conflicts[0].dateTo ? ` → ${conflicts[0].dateTo}` : ""}
                            </div>
                          )}
                      </div>
                    </div>
                    );
                  })}
                  <div style={{ marginTop: 10, padding: "12px 16px", background: "rgba(255,107,0,0.08)", border: `1px solid rgba(255,107,0,0.25)`, borderRadius: 10, fontSize: 13, color: "#ffb27a" }}>
                    All motorcycles include comprehensive insurance, gear rental option, and 24/7 roadside support.
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 18 }}>Your Rider Profile</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[["name", "Full Name", "text", "e.g. Hans Müller"],
                      ["email", "Email Address", "email", "you@example.com"],
                      ["phone", "Phone / WhatsApp", "tel", "+49 ..."],
                      ["country", "Country", "text", "Germany"]
                    ].map(([key, label, type, ph]) => (
                      <div key={key}>
                        <label style={{ fontSize: 12, color: MUTED, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
                        <input type={type} placeholder={ph} className="form-input" value={form[key]}
                          onChange={e => set(key, e.target.value)} style={{ fontSize: 14 }} />
                        {errors[key] && <div style={{ color: "#ff4d4d", fontSize: 12, marginTop: 4 }}>{errors[key]}</div>}
                      </div>
                    ))}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: 12, color: MUTED, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Riding Experience</label>
                      <select className="form-input form-select" value={form.experience} onChange={e => set("experience", e.target.value)} style={{ fontSize: 14 }}>
                        <option value="">Select level…</option>
                        <option value="beginner">Beginner (1-3 years)</option>
                        <option value="intermediate">Intermediate (3-7 years)</option>
                        <option value="advanced">Advanced (7+ years)</option>
                        <option value="expert">Expert / Track Experience</option>
                      </select>
                      {errors.experience && <div style={{ color: "#ff4d4d", fontSize: 12, marginTop: 4 }}>{errors.experience}</div>}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 18 }}>Review & Confirm</div>
                  <div style={{ background: "#161616", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px", marginBottom: 18 }}>
                    {[
                      ["Tour", form.tour],
                      ["Date", form.date],
                      ["Motorcycle", form.bike],
                      ["Rider", form.name],
                      ["Email", form.email],
                      ["Country", form.country],
                      ["Experience", form.experience]
                    ].map(([label, val]) => val && (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14 }}>
                        <span style={{ color: MUTED }}>{label}</span>
                        <span style={{ color: WHITE, fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div onClick={() => set("license", !form.license)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 14, padding: "16px", cursor: "pointer",
                      background: form.license ? "rgba(255,107,0,0.08)" : "#161616",
                      border: `2px solid ${form.license ? ORANGE : BORDER}`, borderRadius: 12, marginBottom: 8, transition: "all 0.2s"
                    }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, border: `2px solid ${form.license ? ORANGE : "#444"}`,
                      background: form.license ? ORANGE : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.2s"
                    }}>
                      {form.license && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.55 }}>
                      <strong style={{ color: WHITE, display: "block", marginBottom: 3 }}>I confirm I hold a valid motorcycle license</strong>
                      I understand that a motorcycle license (minimum Category A2) is required for all tours and will be verified at check-in. Riders without a valid license will not be permitted to participate.
                    </div>
                  </div>
                  {errors.license && <div style={{ color: "#ff4d4d", fontSize: 13, marginBottom: 8 }}>{errors.license}</div>}
                </div>
              )}

              {/* Nav buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
                {step > 0 ? (
                  <button onClick={prev} style={{
                    display: "flex", alignItems: "center", gap: 6, background: "none", border: `1.5px solid ${BORDER}`,
                    color: "#aaa", borderRadius: 10, padding: "12px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit"
                  }}>
                    <IconArrow dir="left" /> Back
                  </button>
                ) : <div />}
                {step < 4 ? (
                  <button onClick={next} style={{
                    display: "flex", alignItems: "center", gap: 8, background: ORANGE, border: "none",
                    color: "#fff", borderRadius: 10, padding: "12px 24px", cursor: "pointer", fontWeight: 800, fontSize: 15, fontFamily: "inherit"
                  }}>
                    Continue <IconArrow />
                  </button>
                ) : (
                  <button onClick={submit} style={{
                    display: "flex", alignItems: "center", gap: 8, background: ORANGE, border: "none",
                    color: "#fff", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontWeight: 800, fontSize: 15, fontFamily: "inherit"
                  }}>
                    Send Reservation Request ✓
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "60px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏍️</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: WHITE, marginBottom: 10 }}>You're In the Queue!</div>
            <div style={{ fontSize: 15, color: MUTED, maxWidth: 360, margin: "0 auto 28px", lineHeight: 1.65 }}>
              Your reservation request for <strong style={{ color: ORANGE }}>{form.tour}</strong> has been received. We'll confirm within 24 hours via email to <strong style={{ color: WHITE }}>{form.email}</strong>.
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)", borderRadius: 12, padding: "14px 22px", marginBottom: 28 }}>
              <IconWA />
              <span style={{ fontSize: 14, color: "#ffb27a" }}>WhatsApp us for faster confirmation: <strong>+373 XX XXX XXX</strong></span>
            </div>
            <button onClick={onClose} style={{ background: ORANGE, border: "none", color: "#fff", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontWeight: 800, fontSize: 15, fontFamily: "inherit" }}>
              Back to Tours
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


// HTML entity sanitiser (char-code loop — no regex, no problematic delimiters)
function esc(s) {
  const ENTITIES = {"38":"&amp;","60":"&lt;","62":"&gt;","34":"&quot;","39":"&#39;"};
  const str = String(s);
  let out = "";
  for (let j = 0; j < str.length; j++) {
    const k = String(str.charCodeAt(j));
    out += ENTITIES[k] !== undefined ? ENTITIES[k] : str[j];
  }
  return out;
}

// ============================================================
// LEAFLET MAP — real OpenStreetMap tiles + custom orange pins
// ============================================================
function LeafletMap({ stops, activeIdx, onHover }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);

  useEffect(() => {
    let cancelled = false;

    function boot() {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const L = window.L;
      const el = containerRef.current;

      // Initialise map
      const map = L.map(el, {
        center: [47.4, 28.4],
        zoom: 7,
        zoomControl: true,
        attributionControl: true,
      });

      // CartoDB Dark Matter tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> \u00a9 <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Dark popup / control styles
      if (!document.getElementById('lf-dark')) {
        const st = document.createElement('style');
        st.id = 'lf-dark';
        st.textContent = [
          '.leaflet-popup-content-wrapper{background:#16161a!important;border:1px solid #2a2a32!important;border-radius:10px!important;box-shadow:0 8px 32px rgba(0,0,0,.7)!important;color:#f0f0f4!important}',
          '.leaflet-popup-tip{background:#16161a!important}',
          '.leaflet-popup-close-button{color:#72727a!important}',
          '.leaflet-popup-close-button:hover{color:#ff6b00!important}',
          '.leaflet-control-zoom a{background:#16161a!important;color:#f0f0f4!important;border-color:#2a2a32!important}',
          '.leaflet-control-zoom a:hover{background:#ff6b00!important;color:#fff!important}',
          '.leaflet-control-attribution{background:rgba(10,10,11,.75)!important;color:#44444c!important;font-size:9px!important}',
          '.leaflet-control-attribution a{color:#72727a!important}',
          '.leaflet-bar{border:1px solid #26262d!important;border-radius:8px!important;overflow:hidden}',
          '@keyframes pulse-ring{0%,100%{box-shadow:0 0 0 0 rgba(255,107,0,.4)}50%{box-shadow:0 0 0 8px rgba(255,107,0,0)}}',
        ].join('');
        document.head.appendChild(st);
      }

      // HTML entity sanitiser for popup content
      function esc(s) {
        const E = {38:'&amp;',60:'&lt;',62:'&gt;',34:'&quot;',39:'&#39;'};
        return String(s).split('').map(ch => E[ch.charCodeAt(0)] || ch).join('');
      }

      // Add markers
      stops.forEach((stop, i) => {
        const isHub     = i === 0;
        const outerSize = isHub ? 32 : 24;
        const innerSize = isHub ? 12 : 8;

        const icon = L.divIcon({
          className: '',
          html: '<div style="width:' + outerSize + 'px;height:' + outerSize + 'px;display:flex;align-items:center;justify-content:center">' +
                '<div style="width:' + outerSize + 'px;height:' + outerSize + 'px;background:rgba(255,107,0,' + (isHub ? 0.18 : 0.12) + ');border-radius:50%;border:1px solid rgba(255,107,0,' + (isHub ? 0.5 : 0.3) + ');display:flex;align-items:center;justify-content:center;animation:' + (isHub ? 'pulse-ring 2.5s infinite' : 'none') + '">' +
                '<div style="width:' + innerSize + 'px;height:' + innerSize + 'px;background:#ff6b00;border-radius:50%;border:2px solid rgba(255,255,255,.9);box-shadow:0 0 8px rgba(255,107,0,.8)"></div>' +
                '</div></div>',
          iconSize:    [outerSize, outerSize],
          iconAnchor:  [outerSize / 2, outerSize / 2],
          popupAnchor: [0, -(outerSize / 2 + 4)],
        });

        const bColor  = i === 0 ? '#ff6b00' : 'rgba(255,107,0,.15)';
        const bTxt    = i === 0 ? '#fff' : '#ff6b00';
        const badge   = i === 0 ? '\u2605' : String(i + 1);
        const popup   =
          '<div style="font-family:-apple-system,sans-serif;min-width:170px;padding:2px 0">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<div style="width:22px;height:22px;border-radius:6px;background:' + bColor + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:' + bTxt + ';flex-shrink:0">' + badge + '</div>' +
          '<strong style="font-size:13px;color:#f0f0f4">' + esc(stop.name)  + '</strong></div>' +
          '<div style="font-size:11px;color:#72727a;margin-bottom:3px">'     + esc(stop.label) + '</div>' +
          '<div style="font-size:11px;color:#ff6b00;font-weight:600">'       + esc(stop.sub)   + '</div></div>';

        const marker = L.marker([stop.lat, stop.lng], { icon })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 210 });

        marker.on('mouseover', () => onHover(i));
        marker.on('mouseout',  () => onHover(null));
        marker.on('click',     () => map.flyTo([stop.lat, stop.lng], 12, { duration: 1 }));

        if (isHub) {
          L.circle([stop.lat, stop.lng], {
            radius: 8000, color: '#ff6b00', fillColor: '#ff6b00',
            fillOpacity: 0.08, weight: 1.5, dashArray: '4 4',
          }).addTo(map);
        }

        markersRef.current.push(marker);
      });

      // Force size recalc after layout settles
      [0, 150, 500].forEach(ms =>
        setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, ms)
      );
    }

    function loadLeaflet() {
      // CSS
      if (!document.getElementById('leaflet-css')) {
        const link    = document.createElement('link');
        link.id       = 'leaflet-css';
        link.rel      = 'stylesheet';
        link.href     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      // JS
      if (window.L) {
        boot();
      } else {
        const script = document.createElement('script');
        script.src   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = boot;
        script.onerror = () => console.warn('Leaflet failed to load');
        document.head.appendChild(script);
      }
    }

    loadLeaflet();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current   = null;
        markersRef.current = [];
      }
    };
  }, []);

  // Hover sync
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    markersRef.current.forEach((m, i) => {
      if (i === activeIdx) {
        m.openPopup();
        mapRef.current.flyTo(
          [stops[i].lat, stops[i].lng],
          Math.max(mapRef.current.getZoom(), 9),
          { duration: 0.6 }
        );
      } else {
        m.closePopup();
      }
    });
  }, [activeIdx]);

  return <div ref={containerRef} style={{ width: '100%', height: '520px', background: '#111' }} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MoldovaMotorTours() {
  const [showBooking, setShowBooking] = useState(false);
  const [defaultTour, setDefaultTour] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [mapHover, setMapHover]       = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  // ── Live data from shared store ──────────────────────────────
  const [liveTours, setLiveTours] = useState([]);
  const [liveFleet, setLiveFleet] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const reloadStore = () => {
    const db = loadDB();
    setLiveTours((db.routes || []).filter(r => r.status === "active" && r.visible !== false).map(routeToTour));
    setLiveFleet(db.fleet || []);
    setAllBookings(db.bookings || []);
  };

  useEffect(() => {
    reloadStore();
    // Sync if admin tab writes while this tab is open
    const onStorage = (e) => { if (e.key === STORAGE_KEY) reloadStore(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  // ────────────────────────────────────────────────────────────

  const openBooking = (tour = "") => { reloadStore(); setDefaultTour(tour); setShowBooking(true); };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const T = testimonials[testimonialIdx];

  return (
    <div style={{ background: DARK, color: WHITE, minHeight: "100vh" }}>
      <style>{style}</style>

      {/* ─── STICKY NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled || menuOpen ? "rgba(10,10,10,0.97)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(12px)" : "none",
        borderBottom: scrolled || menuOpen ? `1px solid ${BORDER}` : "none",
        transition: "all 0.3s"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          height: 68, padding: "0 5%" }}>

          {/* Logo */}
          <a href="#hero" style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff",
              padding: 3, boxShadow: "0 0 0 2px #ff6b00, 0 0 16px rgba(255,107,0,0.45)" }}>
              <img src="/logo.png" alt="Moldova Moto Tours"
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
            </div>
          </a>

          {/* Desktop links — hidden on mobile via CSS */}
          <div className="nav-links" style={{ display: "flex", gap: 32 }}>
            {[["#tours","Tours"],["#experience","Experience"],["#fleet","Fleet"],["#map","Routes"],["#contact","Contact"]].map(([href, label]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
            <Link to="/adventures" className="nav-link" style={{ color: ORANGE }}>Adventures</Link>
          </div>

          {/* Desktop book button — hidden on mobile */}
          <button onClick={() => openBooking()} className="nav-book-btn cta-pulse" style={{
            background: ORANGE, color: "#fff", border: "none", borderRadius: 10,
            padding: "10px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer",
            fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase"
          }}>
            Book Your Tour
          </button>

          {/* Hamburger — mobile only, shown via CSS */}
          <button
            className={"hamburger" + (menuOpen ? " open" : "")}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Open menu"
            style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: 8, width: 42, height: 42, cursor: "pointer",
              display: "none", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 5, padding: 0, flexShrink: 0 }}>
            <span style={{ display: "block", width: 18, height: 2, background: "#f4f4f4",
              borderRadius: 2, transition: "all 0.3s",
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", width: 18, height: 2, background: "#f4f4f4",
              borderRadius: 2, transition: "all 0.3s",
              opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "none" }} />
            <span style={{ display: "block", width: 18, height: 2, background: "#f4f4f4",
              borderRadius: 2, transition: "all 0.3s",
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background: "rgba(10,10,10,0.98)", backdropFilter: "blur(16px)",
            borderTop: `1px solid ${BORDER}`, padding: "8px 0 16px",
            display: "flex", flexDirection: "column" }}>
            {[["#tours","Tours"],["#experience","Experience"],["#fleet","Fleet"],
              ["#map","Routes"],["#contact","Contact"]].map(([href, label]) => (
              <a key={href} href={href}
                onClick={() => setMenuOpen(false)}
                style={{ padding: "14px 24px", fontSize: 15, fontWeight: 700,
                  color: "#ccc", textDecoration: "none", borderBottom: `1px solid ${BORDER}`,
                  letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {label}
              </a>
            ))}
            <Link to="/adventures"
              onClick={() => setMenuOpen(false)}
              style={{ padding: "14px 24px", fontSize: 15, fontWeight: 700,
                color: ORANGE, textDecoration: "none", borderBottom: `1px solid ${BORDER}`,
                letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Adventures
            </Link>
            <button
              onClick={() => { setMenuOpen(false); openBooking(); }}
              style={{ margin: "14px 20px 0", background: ORANGE, color: "#fff",
                border: "none", borderRadius: 10, padding: "15px", fontSize: 15,
                fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                letterSpacing: "0.04em" }}>
              Book Your Tour →
            </button>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section id="hero" style={{ position: "relative", height: "100vh", minHeight: 600, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <img src="/hero.jpg"
          alt="Rider and motorcycle above Soroca fortress, Nistru River and vineyards at sunset"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%" }} />
        <div className="overlay-gradient" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.05) 100%)" }} />

        <div style={{ position: "relative", padding: "0 5%", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <div className="hero-animate" style={{ display: "inline-block", background: ORANGE, color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 14px", borderRadius: 6, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 22 }}>
            🏍️ Guided Tours · Moldova · Eastern Europe
          </div>
          <h1 className="hero-title hero-animate-2" style={{ fontSize: "clamp(44px, 7vw, 88px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.03em", marginBottom: 22, maxWidth: 780 }}>
            Discover Moldova<br /><span style={{ color: ORANGE }}>on Two Wheels</span>
          </h1>
          <p className="hero-sub hero-animate-3" style={{ fontSize: 20, color: "rgba(244,244,244,0.82)", maxWidth: 560, lineHeight: 1.65, marginBottom: 40, fontWeight: 400 }}>
            Guided motorcycle tours through vineyards, cliff monasteries, and the hidden roads of Eastern Europe — on a premium adventure bike.
          </p>
          <div className="hero-animate-4" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={() => document.getElementById("tours").scrollIntoView({ behavior: "smooth" })}
              style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 12, padding: "16px 32px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em" }}>
              Book Your Tour →
            </button>
            <button onClick={() => document.getElementById("map").scrollIntoView({ behavior: "smooth" })}
              style={{ background: "rgba(255,255,255,0.1)", color: WHITE, border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "16px 32px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(6px)" }}>
              View Routes
            </button>
          </div>
          {/* Stats */}
          <div className="hero-animate-4" style={{ display: "flex", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
            {[["300+", "Riders Guided"], ["4.9★", "Average Rating"], ["3", "Tour Lengths"], ["100%", "Licensed Guides"]].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: 28, fontWeight: 900, color: ORANGE, lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 13, color: "rgba(244,244,244,0.6)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.5 }}>
          <div style={{ width: 1, height: 40, background: WHITE, animation: "fadeIn 2s infinite alternate" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: WHITE }}>Scroll</span>
        </div>
      </section>

      {/* ─── EXPERIENCE ─── */}
      <section id="experience" style={{ padding: "100px 5%", background: "#0d0d0d" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>Why Moldova</div>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 18 }}>Europe's Best-Kept<br />Riding Secret</h2>
            <p style={{ fontSize: 17, color: MUTED, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Uncrowded roads, genuine hospitality, and scenery that rivals Tuscany — at a fraction of the price.
            </p>
          </div>
          <div className="exp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "36px 28px", transition: "transform 0.3s" }}>
                <div className="feature-icon-wrap" style={{
                  width: 64, height: 64, borderRadius: 16, background: "rgba(255,107,0,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: ORANGE, marginBottom: 24, transition: "all 0.25s"
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOURS ─── */}
      <section id="tours" style={{ padding: "100px 5%", background: DARK }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>Choose Your Adventure</div>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, letterSpacing: "-0.025em" }}>Our Tours</h2>
          </div>
          {liveTours.length === 0 && (
            <div style={{ color: MUTED, fontSize: 16, padding: "40px 0" }}>Tours coming soon — check back shortly.</div>
          )}
          <div className="tours-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {liveTours.map((t, i) => (
              <div key={t.id} className="tour-card" style={{
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden",
                transition: "transform 0.3s", display: "flex", flexDirection: "column"
              }}>
                <div style={{ position: "relative", overflow: "hidden", height: 220 }}>
                  <img className="tour-card-img" src={t.img} alt={t.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                  <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
                    <span style={{ background: ORANGE, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t.tag}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 16, right: 16 }}>
                    <span style={{ background: "rgba(0,0,0,0.75)", color: "#ccc", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}>⏱ {t.duration}</span>
                  </div>
                </div>
                <div style={{ padding: "24px 24px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{t.title}</h3>
                    <div style={{ fontSize: 26, fontWeight: 900, color: ORANGE, flexShrink: 0, marginLeft: 10 }}>{t.price}</div>
                  </div>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 18, flex: 1 }}>{t.desc}</p>
                  <div style={{ marginBottom: 20 }}>
                    {t.highlights.map((h, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, color: "#bbb" }}>
                        <span style={{ color: ORANGE, fontSize: 16 }}>›</span>{h}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => openBooking(t.title)}
                    style={{ width: "100%", background: ORANGE, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                    Book Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FLEET ─── */}
      <section id="fleet" style={{ padding: "100px 5%", background: "#080808", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -100, top: "50%", transform: "translateY(-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fleet-inner" style={{ display: "flex", gap: 64, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>Your Ride Awaits</div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 20 }}>CFMOTO 800MT<br /><span style={{ color: ORANGE }}>Adventure Class</span></h2>
              <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, marginBottom: 36 }}>
                The CFMOTO 800MT is our chosen mount for Moldova's diverse terrain — from smooth vineyard lanes to the rugged riverside tracks of the Nistru canyon. Powerful, comfortable, and loaded with touring tech.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
                {(liveFleet[0]?.features || fleetFeatures).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#ccc" }}>
                    <IconCheck /><span>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 36, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[["799cc", "Twin-Cylinder"], ["95hp", "Peak Power"], ["±200km", "Daily Range"]].map(([val, label]) => (
                  <div key={label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 24px" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: ORANGE }}>{val}</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85"
                alt="CFMOTO 800MT" style={{ width: "100%", borderRadius: 20, objectFit: "cover", height: 440, border: `1px solid ${BORDER}` }} />
              <div style={{ position: "absolute", bottom: -20, right: -20, background: ORANGE, color: "#fff", borderRadius: 16, padding: "18px 22px", fontWeight: 900, fontSize: 13, lineHeight: 1.4, textAlign: "center" }}>
                All-Inclusive<br /><span style={{ fontSize: 22 }}>€0</span><br /><span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>Extra Bike Fee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAP ─── */}
      <section id="map" style={{ padding: "100px 5%", background: DARK }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>Tour Routes</div>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, letterSpacing: "-0.025em" }}>The Moldova Map</h2>
            <p style={{ color: MUTED, marginTop: 14, fontSize: 16 }}>Real map powered by OpenStreetMap. Click any stop to fly to it.</p>
          </div>

          <div className="map-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "start" }}>

            {/* ── Real OpenStreetMap via Leaflet ── */}
            <div style={{ borderRadius: 20, overflow: "hidden",
              border: `1px solid ${BORDER}`,
              position: "relative", height: 520 }}>
              <LeafletMap stops={mapStops} activeIdx={mapHover} onHover={setMapHover} />
            </div>

            {/* ── Stop detail cards ── */}
            <div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.6 }}>
                Every pin is placed at its real GPS coordinates. Click a card or pin to zoom in.
              </div>
              {mapStops.map((stop, i) => (
                <div key={i}
                  onMouseEnter={() => setMapHover(i)}
                  onMouseLeave={() => setMapHover(null)}
                  style={{
                    borderRadius: 14, marginBottom: 10, cursor: "pointer", overflow: "hidden",
                    background: mapHover === i ? "rgba(255,107,0,0.07)" : CARD,
                    border: `1.5px solid ${mapHover === i ? ORANGE : BORDER}`,
                    transition: "all 0.22s"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px" }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: i === 0 ? ORANGE : "rgba(255,107,0,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: i === 0 ? "#fff" : ORANGE, fontWeight: 900, fontSize: 14
                    }}>
                      {i === 0 ? "★" : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: mapHover === i ? ORANGE : WHITE }}>{stop.name}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {stop.label} · <span style={{ color: ORANGE }}>{stop.sub}</span>
                      </div>
                    </div>
                    <div style={{ color: mapHover === i ? ORANGE : BORDER, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>›</div>
                  </div>
                  {mapHover === i && (
                    <div style={{ padding: "0 18px 14px 72px", fontSize: 13, color: "#b0b8c8", lineHeight: 1.65, animation: "fadeIn 0.2s ease" }}>
                      {stop.desc}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ marginTop: 20, padding: "16px 18px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: ORANGE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Tour Coverage</div>
                {[
                  ["1-Day", "Chișinău → Cricova → Chișinău", "€220"],
                  ["3-Day", "Chișinău → Orheiul Vechi → Saharna", "€650"],
                  ["5-Day", "Full country — all 6 stops", "€1,050"]
                ].map(([dur, route, price]) => (
                  <div key={dur} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 2, background: ORANGE, borderRadius: 1, opacity: 0.6 }}/>
                      <span style={{ color: "#999" }}>{route}</span>
                    </div>
                    <span style={{ color: ORANGE, fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>{price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: "100px 5%", background: "#080808" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>Rider Reviews</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: 56 }}>Straight from the Saddle</h2>
          <div style={{ position: "relative", minHeight: 220 }}>
            <div key={testimonialIdx} style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ fontSize: "clamp(18px, 3vw, 28px)", fontFamily: "Lora, serif", fontStyle: "italic", color: WHITE, lineHeight: 1.65, marginBottom: 32, maxWidth: 680, margin: "0 auto 32px" }}>
                "{T.text}"
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 32 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
                  {T.name[0]}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 800, color: WHITE }}>{T.name}</div>
                  <div style={{ fontSize: 13, color: MUTED }}>{T.country}</div>
                </div>
                <div style={{ marginLeft: 8 }}>{"★".repeat(T.stars).split("").map((s, i) => <span key={i} className="testimonial-star">{s}</span>)}</div>
              </div>
            </div>
            {/* Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)} style={{
                  width: i === testimonialIdx ? 28 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                  background: i === testimonialIdx ? ORANGE : BORDER, transition: "all 0.3s", padding: 0
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <div style={{ background: ORANGE, padding: "60px 5%", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Your Adventure Starts Here
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 17, marginBottom: 30 }}>Limited spots per departure. Reserve your seat before they're gone.</p>
        <button onClick={() => openBooking()} style={{
          background: "#fff", color: ORANGE, border: "none", borderRadius: 12, padding: "16px 36px",
          fontWeight: 900, fontSize: 17, cursor: "pointer", fontFamily: "inherit"
        }}>
          Book Your Tour →
        </button>
      </div>

      {/* ─── FOOTER / CONTACT ─── */}
      <footer id="contact" style={{ background: "#060606", padding: "80px 5% 40px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr", gap: 48, marginBottom: 60 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#fff",
                  padding: 3, flexShrink: 0,
                  boxShadow: "0 0 0 2px #ff6b00, 0 0 20px rgba(255,107,0,0.4)" }}>
                  <img src="/logo.png" alt="Moldova Moto Tours"
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: WHITE, lineHeight: 1.1 }}>Moldova Moto Tours</div>
                  <div style={{ fontSize: 11, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>The Last Untamed Roads of Europe</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, marginBottom: 24 }}>
                The premier guided motorcycle tour company in Moldova. Connecting international riders with Eastern Europe's most authentic hidden roads since 2019.
              </p>
              <div style={{ display: "flex", gap: 14 }}>
                <a href="https://wa.me/37300000000" style={{ display: "flex", alignItems: "center", gap: 8, color: "#25D366", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
                  <IconWA /> WhatsApp
                </a>
                <a href="https://instagram.com" style={{ display: "flex", alignItems: "center", gap: 8, color: "#C13584", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
                  <IconIG /> Instagram
                </a>
              </div>
            </div>
            {/* Tours */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 18 }}>Tours</div>
              {liveTours.map(t => (
                <div key={t.id} style={{ marginBottom: 10 }}>
                  <a href="#tours" style={{ color: MUTED, textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = WHITE} onMouseLeave={e => e.target.style.color = MUTED}>
                    {t.title} — {t.price}
                  </a>
                </div>
              ))}
            </div>
            {/* Info */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 18 }}>Info</div>
              {["About Us", "Our Fleet", "Route Map", "Safety & Licensing", "FAQ", "Terms & Conditions"].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: MUTED, textDecoration: "none", fontSize: 14 }}
                    onMouseEnter={e => e.target.style.color = WHITE} onMouseLeave={e => e.target.style.color = MUTED}>
                    {l}
                  </a>
                </div>
              ))}
            </div>
            {/* Contact form */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 18 }}>Send a Message</div>
              {!contactSent ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input type="text" placeholder="Your name" className="form-input" value={contactForm.name}
                    onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} style={{ fontSize: 14 }} />
                  <input type="email" placeholder="Email address" className="form-input" value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} style={{ fontSize: 14 }} />
                  <textarea placeholder="Your question or message…" className="form-input" rows={4} value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    style={{ fontSize: 14, resize: "vertical", minHeight: 90 }} />
                  <button onClick={() => { if (contactForm.name && contactForm.email) setContactSent(true); }}
                    style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                    Send Message
                  </button>
                </div>
              ) : (
                <div style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)", borderRadius: 12, padding: "24px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                  <div style={{ color: ORANGE, fontWeight: 700 }}>Message sent!</div>
                  <div style={{ color: MUTED, fontSize: 13, marginTop: 6 }}>We&apos;ll reply within 24 hours.</div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13, color: MUTED }}>© {new Date().getFullYear()} MoldovaMoto. All rights reserved. · Chișinău, Republic of Moldova</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ fontSize: 12, color: "#444", letterSpacing: "0.08em" }}>
                <span style={{ color: "#333" }}>SEO: </span>Motorcycle Tours Moldova · Adventure Riding Eastern Europe · CFMOTO Rental Moldova
              </div>
              <Link to="/admin" style={{ fontSize: 11, color: "#333", textDecoration: "none", borderLeft: `1px solid #222`, paddingLeft: 16, letterSpacing: "0.06em", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = MUTED} onMouseLeave={e => e.target.style.color = "#333"}>
                Admin ↗
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── BOOKING MODAL ─── */}
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} defaultTour={defaultTour} tours={liveTours} fleet={liveFleet} allBookings={allBookings} />}
    </div>
  );
}
