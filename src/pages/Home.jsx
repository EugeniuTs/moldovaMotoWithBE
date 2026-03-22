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
  .overlay-gradient { background: linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.15) 100%); }
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .hero-title { font-size: clamp(36px, 10vw, 72px) !important; }
    .hero-sub { font-size: 16px !important; }
    .tours-grid { grid-template-columns: 1fr !important; }
    .exp-grid { grid-template-columns: 1fr 1fr !important; }
    .fleet-inner { flex-direction: column !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
    .steps-bar { gap: 4px !important; }
    .step-label { display: none !important; }
  }
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
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/>
    <path d="M6 17l3-6h4l3-4h2M9 11l1 6M12 5h3"/>
  </svg>
);
const IconGuide = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="3"/><path d="M5.5 21v-2a4 4 0 014-4h5a4 4 0 014 4v2M12 14v7M9 17h6"/>
  </svg>
);
const IconMoto = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M5 13l2-6h7l2 4 3 1v4"/><circle cx="5.5" cy="16.5" r="2.5"/><circle cx="18.5" cy="16.5" r="2.5"/>
    <path d="M15 7V4l3 1"/>
  </svg>
);
const IconRoute = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 17c3-4 5-8 9-8s6 4 9 8"/><circle cx="3" cy="17" r="1.5"/><circle cx="21" cy="17" r="1.5"/>
    <path d="M12 9V3M9 6l3-3 3 3"/>
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
  { x: 186, y: 199, name: "Chișinău", label: "Capital City", sub: "Tour Start / End",
    desc: "Your tour begins in Moldova's vibrant capital. Pick up your CFMOTO 800MT, meet your guide, and ride out." },
  { x: 195, y: 148, name: "Orheiul Vechi", label: "Cliff Monastery", sub: "★ Unmissable",
    desc: "A 6th-century monastery carved into limestone cliffs above the Răut River — one of Europe's most dramatic natural amphitheatres." },
  { x: 187, y: 183, name: "Cricova", label: "Underground Wine City", sub: "1-Day Tour",
    desc: "120 km of underground galleries turned wine cellar. The Soviet-era labyrinth holds millions of bottles beneath rolling vineyards." },
  { x: 194, y: 104, name: "Saharna", label: "Nistru Canyon & Monastery", sub: "3 & 5-Day Tour",
    desc: "An 18th-century monastery tucked above a dramatic Dniester canyon waterfall. Remote, pristine, and completely unforgettable." },
  { x: 144, y: 57,  name: "Soroca", label: "Medieval Fortress", sub: "5-Day Tour",
    desc: "Moldova's perfectly preserved 16th-century Genoese-Ottoman fortress, sitting on the Dniester riverbank at the Ukrainian border." },
  { x: 232, y: 221, name: "Bender", label: "Ottoman Fortress", sub: "5-Day Tour",
    desc: "A massive 16th-century Ottoman citadel commanding the Dniester with centuries of turbulent history etched into every stone bastion." }
];

// ============================================================
// BOOKING MODAL
// ============================================================
const STEP_LABELS = ["Tour", "Date", "Bike", "Rider Info", "Confirm"];

function BookingModal({ onClose, defaultTour = "", tours = [], fleet = [], allBookings = [] }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    tour: defaultTour, date: "", departureId: "", bike: "", rentalDays: 1,
    name: "", email: "", phone: "", country: "", experience: "",
    license: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (step === 0 && !form.tour) e.tour = "Please select a tour";
    if (step === 1) {
      if (isOpenDate && !form.date) e.date = "Please pick a start date";
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
                  {tours.map(t => (
                    <div key={t.id} onClick={() => set("tour", t.title)}
                      style={{
                        border: `1.5px solid ${form.tour === t.title ? ORANGE : BORDER}`,
                        borderRadius: 12, padding: "16px 18px", marginBottom: 12, cursor: "pointer",
                        background: form.tour === t.title ? "rgba(255,107,0,0.08)" : "#161616",
                        display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s"
                      }}>
                      <div>
                        <div style={{ fontWeight: 700, color: WHITE, marginBottom: 2 }}>{t.title}</div>
                        <div style={{ fontSize: 13, color: MUTED }}>{t.duration}</div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: ORANGE }}>{t.price}</div>
                    </div>
                  ))}
                  {errors.tour && <div style={{ color: "#ff4d4d", fontSize: 13, marginTop: 4 }}>{errors.tour}</div>}
                </div>
              )}

              {step === 1 && (
                <div>
                  {isOpenDate ? (
                    /* ── Free / open date: date-picker + rental days ── */
                    <>
                      <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 6 }}>Choose your date</div>
                      <div style={{ fontSize: 14, color: MUTED, marginBottom: 20 }}>Pick any start date — your bike will be reserved for the full period.</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                          <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Start Date</label>
                          <input type="date" className="form-input" min={today} value={form.date}
                            onChange={e => set("date", e.target.value)}
                            style={{ fontSize: 14, colorScheme: "dark" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Days (1 – 14)</label>
                          <input type="number" className="form-input" min="1" max="14" value={form.rentalDays || 1}
                            onChange={e => set("rentalDays", Math.max(1, Math.min(14, Number(e.target.value))))}
                            style={{ fontSize: 14 }} />
                        </div>
                      </div>
                      {form.date && (
                        <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.25)", borderRadius: 10, fontSize: 13, color: "#ffb27a" }}>
                          Total: €{((selectedTour?.priceNum || 0) * (form.rentalDays || 1)).toLocaleString()} · {form.rentalDays || 1} day{form.rentalDays > 1 ? "s" : ""} rental
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
                  <div style={{ fontSize: 14, color: MUTED, marginBottom: 16 }}>Select an available motorcycle from our fleet.</div>
                  {fleet.filter(b => b.status === "available").length === 0 && (
                    <div style={{ color: MUTED, fontSize: 13, padding: "16px 0" }}>No bikes available for this date — please contact us directly.</div>
                  )}
                  {fleet.filter(b => b.status === "available").map(bike => (
                    <div key={bike.id} onClick={() => set("bike", bike.name)}
                      style={{
                        border: `2px solid ${form.bike === bike.name ? ORANGE : BORDER}`,
                        borderRadius: 14, overflow: "hidden", background: "#161616",
                        marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s"
                      }}>
                      <div style={{ padding: "16px 20px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <div style={{ background: ORANGE, color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>Available</div>
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
                      </div>
                    </div>
                  ))}
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

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MoldovaMotorTours() {
  const [showBooking, setShowBooking] = useState(false);
  const [defaultTour, setDefaultTour] = useState("");
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
    setLiveTours((db.routes || []).filter(r => r.status === "active").map(routeToTour));
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
        background: scrolled ? "rgba(10,10,10,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        transition: "all 0.35s ease", padding: "0 5%"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          <a href="#hero" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: ORANGE, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="M6 16l3-7h5l3-5h2"/></svg>
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, color: WHITE, letterSpacing: "-0.02em" }}>Moldova<span style={{ color: ORANGE }}>Moto</span></span>
            </div>
          </a>
          <div className="nav-links" style={{ display: "flex", gap: 36 }}>
            {[["#tours", "Tours"], ["#experience", "Experience"], ["#fleet", "Fleet"], ["#map", "Routes"], ["#contact", "Contact"]].map(([href, label]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
          </div>
          <button onClick={() => openBooking()} className="cta-pulse" style={{
            background: ORANGE, color: "#fff", border: "none", borderRadius: 10,
            padding: "10px 22px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            letterSpacing: "0.04em", textTransform: "uppercase"
          }}>
            Book Your Tour
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section id="hero" style={{ position: "relative", height: "100vh", minHeight: 600, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1800&q=85"
          alt="Motorcycle touring" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
        <div className="overlay-gradient" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />

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
            <p style={{ color: MUTED, marginTop: 14, fontSize: 16 }}>Hover any stop to explore your destination — all coordinates are geographically accurate.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "start" }}>

            {/* ── Accurate Moldova SVG ── */}
            <div style={{ background: "#060d16", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "20px 16px", position: "relative", overflow: "hidden" }}>
              {/* Legend */}
              <div style={{ display: "flex", gap: 18, marginBottom: 14, paddingLeft: 4, flexWrap: "wrap" }}>
                {[["#2a6090","Prut River"], ["#1e7ab0","Nistru River"], ["#1a3550","Răut River"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: MUTED }}>
                    <div style={{ width: 20, height: 2.5, background: c, borderRadius: 2 }} />{l}
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: MUTED }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ORANGE }} /> Tour Stop
                </div>
              </div>

              {/*
                Coordinate system (ViewBox 0 0 300 420):
                  x = 20 + (lon − 26.62) × 74.07
                  y = 390 − (lat − 45.47) × 124.17
                Moldova border traced from real WGS-84 boundary waypoints.
                Key lon/lat → SVG anchors:
                  Lipcani    48.26N 26.81E → (34, 44)
                  Ocnița     48.39N 27.44E → (81, 28)
                  Soroca     48.15N 28.29E → (144, 57)
                  NE corner  48.48N 28.99E → (196, 16)
                  E bulge    47.70N 30.10E → (278,113)
                  Bender     46.83N 29.48E → (232,221)
                  Giurgiul.  45.47N 28.55E → (163,390)
                  Cahul      45.90N 28.25E → (141,337)
                  Ungheni    47.21N 27.80E → (107,174)
                  Costești   47.86N 27.67E → (98, 93)
              */}
              <svg viewBox="0 0 300 420" style={{ width: "100%", height: "auto", display: "block" }}>
                <defs>
                  <filter id="stopGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <linearGradient id="moldovaBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f2035"/>
                    <stop offset="100%" stopColor="#0a1825"/>
                  </linearGradient>
                </defs>

                {/* Subtle grid */}
                <g stroke="#ffffff" strokeWidth="0.3" opacity="0.04">
                  {[50,100,150,200,250,300,350,400].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y}/>)}
                  {[50,100,150,200,250].map(x => <line key={x} x1={x} y1="0" x2={x} y2="420"/>)}
                </g>

                {/* ── Moldova country fill ──
                    Border path clockwise from NW (Lipcani):
                    N border → NE corner → E border (Transnistria bulge) → S border → W border (Prut) */}
                <path
                  d={[
                    "M 34,44",          // Lipcani NW
                    "L 54,30",          // Briceni
                    "L 81,28",          // Ocnița
                    "L 93,49",          // dip S
                    "L 144,57",         // Soroca (on Dniester)
                    "L 182,19",         // NE bulge
                    "L 196,16",         // NE corner
                    "L 233,45",         // E border descending
                    "L 259,76",
                    "L 278,113",        // Transnistria eastern extreme
                    "L 262,153",
                    "L 248,185",
                    "L 232,221",        // Bender / Tighina
                    "L 233,262",
                    "L 248,297",
                    "L 241,337",
                    "L 219,355",
                    "L 189,378",        // SE
                    "L 163,390",        // Giurgiulești (S)
                    "L 137,390",        // SW tip
                    "L 141,337",        // Cahul (W border going N)
                    "L 142,263",        // Leova
                    "L 126,213",
                    "L 107,174",        // Ungheni
                    "L 89,178",         // Sculeni (Prut meander W)
                    "L 91,162",
                    "L 94,137",
                    "L 93,119",
                    "L 98,93",          // Costești
                    "L 87,82",
                    "L 72,70",
                    "L 63,64",
                    "Z"
                  ].join(" ")}
                  fill="url(#moldovaBg)"
                  stroke="#1e3f60"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />

                {/* ── Transnistria region overlay ──
                    Shaded area east of Dniester, controlled territory */}
                <path
                  d={[
                    "M 208,168",   // Dubăsari (N of Transnistria)
                    "L 218,182",
                    "L 232,221",   // Bender
                    "L 233,262",
                    "L 248,297",
                    "L 241,337",
                    "L 219,355",
                    "L 210,366",   // follow Dniester exit
                    "L 218,340",
                    "L 222,310",
                    "L 218,286",
                    "L 222,265",
                    "L 218,235",
                    "L 215,215",   // Grigoriopol
                    "L 208,190",
                    "L 208,168"
                  ].join(" ")}
                  fill="#0d1f30"
                  stroke="#1a3348"
                  strokeWidth="1"
                  opacity="0.7"
                />
                {/* Transnistria label */}
                <text x="236" y="275" fill="#304860" fontSize="7" fontFamily="Archivo,sans-serif"
                  fontWeight="600" letterSpacing="0.06em" textAnchor="middle"
                  transform="rotate(-78, 236, 275)" opacity="0.7">TRANSNISTRIA</text>

                {/* ── Prut River (western border with Romania) ──
                    Flows S along the western boundary */}
                <path
                  d="M 35,46 C 48,56 60,63 65,66 C 70,70 80,79 87,85 C 92,92 97,101 96,111
                     C 95,119 94,128 93,137 C 91,148 89,161 90,170 C 91,177 97,179 107,175
                     C 116,185 122,203 126,214 C 130,228 136,248 142,264 C 143,279 142,299
                     141,314 C 140,326 140,333 141,338 C 140,354 139,373 137,390"
                  fill="none" stroke="#2a6090" strokeWidth="1.8" opacity="0.75" strokeLinecap="round"
                />

                {/* ── Nistru / Dniester River ──
                    Enters at Ocnița (81,28) → Soroca (144,57) → Rezina (194,108)
                    → Dubăsari (208,168) → Bender (232,221) → exits near (189,378) */}
                <path
                  d="M 81,28 C 100,36 122,47 144,57 C 160,66 178,87 194,108
                     C 200,127 206,148 208,168 L 218,182
                     C 222,192 228,208 232,221 C 232,239 233,253 232,263
                     C 233,275 238,287 240,299 C 239,313 234,329 228,343
                     C 220,356 210,367 199,374 L 189,378"
                  fill="none" stroke="#1e7ab0" strokeWidth="2.2" opacity="0.85" strokeLinecap="round"
                />

                {/* ── Răut River (tributary through Orheiul Vechi) ──
                    Flows from Bălți (116,105) SE through Orhei, joins Nistru near (200,149) */}
                <path
                  d="M 116,105 C 126,115 138,126 152,136 C 164,145 180,149 195,148 C 199,148 203,149 207,152"
                  fill="none" stroke="#1a5070" strokeWidth="1.3" opacity="0.7" strokeLinecap="round"
                />

                {/* ── Tour route lines ── */}
                <g fill="none" stroke={ORANGE} strokeWidth="1.4" strokeDasharray="5,4" opacity="0.45">
                  {/* Chișinău ↔ Cricova */}
                  <line x1="186" y1="199" x2="187" y2="183"/>
                  {/* Cricova ↔ Orheiul Vechi */}
                  <line x1="187" y1="183" x2="195" y2="148"/>
                  {/* Orheiul Vechi ↔ Saharna */}
                  <line x1="195" y1="148" x2="194" y2="104"/>
                  {/* Saharna ↔ Soroca */}
                  <line x1="194" y1="104" x2="144" y2="57"/>
                  {/* Chișinău ↔ Bender */}
                  <line x1="186" y1="199" x2="232" y2="221"/>
                </g>

                {/* ── Neighbouring country labels ── */}
                <text x="26" y="220" fill="#1e3a58" fontSize="8.5" fontFamily="Archivo,sans-serif"
                  fontWeight="700" letterSpacing="0.12em" textAnchor="middle"
                  transform="rotate(-90, 26, 220)">ROMANIA</text>
                <text x="155" y="9" fill="#1a3050" fontSize="8.5" fontFamily="Archivo,sans-serif"
                  fontWeight="700" letterSpacing="0.12em" textAnchor="middle">UKRAINE</text>
                <text x="265" y="9" fill="#1a3050" fontSize="8.5" fontFamily="Archivo,sans-serif"
                  fontWeight="700" letterSpacing="0.12em" textAnchor="middle">UKRAINE</text>

                {/* River labels */}
                <text x="55" y="178" fill="#2a6090" fontSize="7.5" fontFamily="Archivo,sans-serif"
                  fontWeight="600" textAnchor="middle" transform="rotate(-82, 55, 178)" opacity="0.8">Prut R.</text>
                <text x="226" y="135" fill="#1e7ab0" fontSize="7.5" fontFamily="Archivo,sans-serif"
                  fontWeight="600" textAnchor="middle" transform="rotate(-72, 226, 135)" opacity="0.85">Nistru R.</text>
                <text x="161" y="143" fill="#1a5070" fontSize="7" fontFamily="Archivo,sans-serif"
                  fontWeight="600" textAnchor="middle" transform="rotate(-15, 161, 143)" opacity="0.75">Răut R.</text>

                {/* ── Tour stop markers ── */}
                {mapStops.map((stop, i) => {
                  const active = mapHover === i;
                  const isHub  = i === 0;
                  // label anchor: stops on right side of map get label on left
                  const onRight = stop.x > 190;
                  const lx = onRight ? stop.x - 13 : stop.x + 13;
                  const anchor = onRight ? "end" : "start";
                  return (
                    <g key={i} className="map-stop"
                      onMouseEnter={() => setMapHover(i)}
                      onMouseLeave={() => setMapHover(null)}>
                      {/* Pulse ring */}
                      {(active || isHub) && (
                        <circle cx={stop.x} cy={stop.y} r={isHub ? 14 : 12}
                          fill="none" stroke={ORANGE} strokeWidth="1.2" opacity={active ? 0.5 : 0.3}/>
                      )}
                      {/* Main dot */}
                      <circle cx={stop.x} cy={stop.y}
                        r={active ? 8 : isHub ? 7 : 5.5}
                        fill={active || isHub ? ORANGE : "#1a3f65"}
                        stroke={ORANGE}
                        strokeWidth={active ? 0 : 1.5}
                        style={{ transition: "all 0.22s", filter: active ? "url(#stopGlow)" : "none" }}
                      />
                      {/* Label */}
                      <text x={lx} y={stop.y - 2}
                        fill={active ? ORANGE : "#cdd8e8"}
                        fontSize={active ? "10.5" : "9.5"}
                        fontWeight={active || isHub ? "700" : "500"}
                        fontFamily="Archivo,sans-serif"
                        textAnchor={anchor}
                        style={{ transition: "all 0.22s" }}>
                        {stop.name}
                      </text>
                      {/* Sub-label */}
                      <text x={lx} y={stop.y + 9}
                        fill={active ? "rgba(255,107,0,0.75)" : "#4a6080"}
                        fontSize="7.5"
                        fontFamily="Archivo,sans-serif"
                        textAnchor={anchor}>
                        {stop.label}
                      </text>
                    </g>
                  );
                })}

                {/* MOLDOVA country label */}
                <text x="140" y="295" fill="#1a3558" fontSize="11" fontFamily="Archivo,sans-serif"
                  fontWeight="900" textAnchor="middle" letterSpacing="0.18em" opacity="0.5">MOLDOVA</text>
              </svg>

              {/* Compass rose */}
              <div style={{ position: "absolute", bottom: 28, left: 28, opacity: 0.35 }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <line x1="16" y1="2" x2="16" y2="30" stroke="#aaa" strokeWidth="1"/>
                  <line x1="2" y1="16" x2="30" y2="16" stroke="#aaa" strokeWidth="1"/>
                  <polygon points="16,2 13,10 19,10" fill="#aaa"/>
                  <text x="16" y="8" textAnchor="middle" fontSize="6" fill="#ccc" fontFamily="Archivo,sans-serif" fontWeight="700">N</text>
                </svg>
              </div>
              {/* Scale bar */}
              <div style={{ position: "absolute", bottom: 30, right: 28, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, opacity: 0.4 }}>
                <div style={{ width: 48, height: 2, background: "#aaa", borderRadius: 1 }}/>
                <span style={{ fontSize: 9, color: "#aaa", fontFamily: "Archivo,sans-serif" }}>≈ 50 km</span>
              </div>
            </div>

            {/* ── Stop detail cards ── */}
            <div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.6 }}>
                Every stop below is pinned to its real GPS location on the map. Hover to cross-highlight.
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
                  {/* Expandable description on hover */}
                  {mapHover === i && (
                    <div style={{ padding: "0 18px 14px 72px", fontSize: 13, color: "#b0b8c8", lineHeight: 1.65, animation: "fadeIn 0.2s ease" }}>
                      {stop.desc}
                    </div>
                  )}
                </div>
              ))}

              {/* Quick route legend */}
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ background: ORANGE, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="M6 16l3-7h5l3-5h2"/></svg>
                </div>
                <span style={{ fontWeight: 900, fontSize: 20, color: WHITE }}>Moldova<span style={{ color: ORANGE }}>Moto</span></span>
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
