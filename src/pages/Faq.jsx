import SeoHead from "../seo/SeoHead";
import PageShell, { COLORS } from "../seo/PageShell";

const { ORANGE, BORDER } = COLORS;

const FAQ = [
  {
    group: "Booking & payment",
    items: [
      { q: "How do I reserve a tour?",
        a: "Pick a tour on the homepage, choose a departure date and submit the 5-step booking form. You'll get a confirmation email within 24 hours. We then send a payment link for a 30% deposit to lock in your seat." },
      { q: "What is your cancellation policy?",
        a: "Free cancellation up to 30 days before departure (full deposit refund). 30–14 days out: 50% refund. Inside 14 days: non-refundable, but we'll reschedule you onto any open departure in the same season at no charge." },
      { q: "Which payment methods do you accept?",
        a: "All major cards (Visa, Mastercard, Amex) via Stripe. Bank transfer (SEPA) on request. We do not accept cash on the day — everything is paid before the tour starts." },
      { q: "Do you offer group discounts?",
        a: "Yes — 10% off per rider for groups of 4+, 15% for 6+. Groups larger than 8 are split into two guided pods with two lead riders." },
      { q: "Is insurance included?",
        a: "Yes. Third-party liability and comprehensive motorcycle damage insurance with €750 excess are included on every tour. Personal travel/medical insurance is your responsibility — we recommend buying it for the duration of your trip." },
    ],
  },
  {
    group: "Licenses & age",
    items: [
      { q: "Which license do I need?",
        a: "A full category A motorcycle license issued by your home country. Category A2 is accepted if the bike is restricted accordingly — ask us in advance. We need a photo of the front and back before departure." },
      { q: "Do I need an International Driving Permit (IDP)?",
        a: "Required for non-EU licenses (US, UK post-Brexit, Canada, Australia, etc.). You can get one in your home country in 10 minutes — bring it alongside your domestic license." },
      { q: "What's the minimum age?",
        a: "21 with at least 2 years of A-category riding experience. Under 25 pays a €150 young-rider surcharge because of insurance costs." },
      { q: "Can I bring a passenger (pillion)?",
        a: "Yes on the 1-Day Wine Ride and open-date rentals if the pillion has a helmet and full protective gear. Multi-day tours are rider-only for comfort and luggage capacity." },
    ],
  },
  {
    group: "The motorcycles",
    items: [
      { q: "What bikes do you run?",
        a: "2023–2024 CFMOTO 800MT Adventure — 800 cc parallel-twin, 95 hp, ABS, switchable traction control, cruise control, heated grips, and a 19\" front wheel for mixed surfaces. All under 15,000 km and dealer-serviced." },
      { q: "What's the seat height?",
        a: "835 mm standard. A low-seat option (815 mm) is available for two of the bikes — request when booking." },
      { q: "Can I bring my own bike?",
        a: "For guided tours no — we keep the fleet identical for safety and spare-part logistics. Self-guided riders on the open-date rental can instead join one of our route briefings and ride their own machine (€80 briefing fee)." },
      { q: "Is luggage provided?",
        a: "Each bike has 2× side panniers (30 L each) and a top box (39 L) — enough for 5 days of gear plus laptop. Soft drybags are available at no charge if you prefer." },
    ],
  },
  {
    group: "Gear & what to bring",
    items: [
      { q: "What gear is included?",
        a: "Helmet (if needed), jacket and trousers with CE armor, and gloves in your size. We carry sizes XS–XXXL. Boots are your responsibility — we recommend over-the-ankle riding boots." },
      { q: "What should I pack?",
        a: "Riding boots, base layers (merino is ideal), a waterproof shell, sunglasses, sunscreen, charger/adapter, and any medication you need. Everything else — laundry, water, snacks — we handle along the route." },
      { q: "What if it's cold?",
        a: "We run tours April–October. Spring and autumn mornings can be 8–12°C — bring a thermal layer. The CFMOTO's heated grips keep hands warm; the jackets have removable thermal liners." },
    ],
  },
  {
    group: "Routes & difficulty",
    items: [
      { q: "What experience level is required?",
        a: "The 1-Day Wine Ride is beginner-friendly — flat tarmac, moderate pace. The 3-Day Adventure is intermediate — longer days, some broken tarmac, one short gravel section. The 5-Day Grand is advanced — 250–300 km days, a 20 km hardpack gravel section, and summer heat." },
      { q: "Are the roads paved?",
        a: "About 90% of every route is paved tarmac. We deliberately include some hardpack gravel on the 3- and 5-day tours because that's where the best scenery is — but you can skip it and we'll re-route around on request." },
      { q: "How large are the groups?",
        a: "Maximum 6 riders on the 1-Day Wine Ride, 8 on the 3-Day Adventure, 5 on the 5-Day Grand. One guide per pod. Private tours for solo riders or couples available on request." },
    ],
  },
  {
    group: "Weather & season",
    items: [
      { q: "When is the best time to ride in Moldova?",
        a: "Late April through mid-October. May and September are our favorites — 18–24°C, empty roads, vineyards in full color. July/August can hit 34°C; we start earlier in the morning to beat the heat." },
      { q: "What happens if it rains?",
        a: "We ride unless it's unsafe. CFMOTO 800MT + heated grips + waterproof gear handle light rain comfortably. If lightning/heavy storms hit, we stop, wait it out at a café, and adjust the day's schedule. Full cancellation from our side: full refund or reschedule." },
      { q: "Is winter riding possible?",
        a: "No — we pause all tours from mid-November through March. Moldovan winter roads get salted and icy; it's not the right experience." },
    ],
  },
  {
    group: "Safety & support",
    items: [
      { q: "What safety briefing do you run?",
        a: "Every tour starts with a 45-minute briefing: bike controls, intercom protocol, hand signals, overtaking rules and what to do if separated. Our guides carry a first-aid kit, a tool roll and a spare clutch/brake lever set." },
      { q: "What if my bike breaks down?",
        a: "Our van (following the 3- and 5-day tours) carries a spare bike. On day tours, Moldova is small enough that our support team can reach any route in under 90 minutes with a replacement." },
      { q: "Is Moldova safe?",
        a: "Yes. Moldova is a safe country to travel in — violent crime is rare and our guides have operated these routes without serious incident for years. The only area we deliberately avoid is the immediate border with Transnistria, which we route around." },
    ],
  },
  {
    group: "Travel logistics",
    items: [
      { q: "How do I get to the starting point?",
        a: "Most tours start at our Chișinău garage (20 min from KIV airport). Airport pickup is included on the 3-day and 5-day tours. Rental riders: Uber/Yandex to the garage costs about €5." },
      { q: "Is accommodation included?",
        a: "Yes on multi-day tours: boutique guesthouses in Orheiul Vechi / Soroca / Purcari, private rooms, breakfast included. Single-supplement €25/night if you want your own room." },
      { q: "What about meals?",
        a: "Lunch included every day. Dinner included on the 3-day and 5-day (local winery or family restaurant). Breakfast at the hotel. Dietary restrictions — tell us when you book." },
    ],
  },
  {
    group: "Moldova specifics",
    items: [
      { q: "Do I need a visa?",
        a: "EU, UK, US, Canada, Australia, Japan — no visa for stays under 90 days. Other passports: check the Moldovan Ministry of Foreign Affairs site or ask us when you enquire." },
      { q: "What currency is used?",
        a: "Moldovan Leu (MDL). Cards work in most restaurants and hotels in Chișinău; cash is useful in villages. ATMs everywhere in the capital. Our prices are quoted in EUR and billed in EUR." },
      { q: "Do we go into Transnistria?",
        a: "No. It's a breakaway region with a separate de-facto administration and it complicates insurance and recovery. Our routes stay entirely in government-controlled territory." },
      { q: "What language is spoken?",
        a: "Romanian is the official language; Russian is widely used. Our guides speak English and German fluently. Staff at hotels/wineries on our routes all speak enough English to help." },
    ],
  },
];

const flatFaq = FAQ.flatMap(g => g.items);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": flatFaq.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a },
  })),
};

export default function Faq() {
  return (
    <PageShell>
      <SeoHead
        title="Motorcycle Tour FAQ — License, Weather, Safety | MoldovaMoto"
        description="Answers to every question our riders ask before booking: licenses, age limits, weather windows, gear, safety, payment, cancellation, and more."
        canonical="https://moldovamoto.com/faq"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>Rider FAQ</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 14px" }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: 17, color: "rgba(244,244,244,0.75)", marginBottom: 20 }}>
          Everything our riders ask before they book. If your question isn't here,{" "}
          <a href="mailto:hello@moldovamoto.com">email us</a> and we'll answer within 24 hours.
        </p>
        {FAQ.map(group => (
          <section key={group.group} style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 18, marginTop: 28 }}>
            <h2>{group.group}</h2>
            {group.items.map(({ q, a }) => (
              <details key={q} style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 16 }}>{q}</summary>
                <p style={{ marginTop: 10 }}>{a}</p>
              </details>
            ))}
          </section>
        ))}
      </article>
    </PageShell>
  );
}
