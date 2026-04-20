import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";

const { ORANGE, BORDER, MUTED, WHITE } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": "3-Day Moldova Adventure — Orheiul Vechi, Saharna & Nistru by Motorcycle",
    "description": "A three-day guided motorcycle tour from Chișinău to the cliff monastery of Orheiul Vechi, the Saharna waterfalls and the Nistru river canyon, with a night in a traditional Butuceni guesthouse.",
    "touristType": ["Motorcycling enthusiasts", "Adventure travellers", "Cultural heritage travellers"],
    "image": "https://moldovamoto.com/og-cover.jpg",
    "url": "https://moldovamoto.com/tours/3-day-moldova-adventure",
    "provider": {
      "@type": "Organization",
      "name": "MoldovaMoto",
      "url": "https://moldovamoto.com/"
    },
    "offers": {
      "@type": "Offer",
      "price": "650",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://moldovamoto.com/tours/3-day-moldova-adventure",
      "validFrom": "2026-04-04"
    },
    "itinerary": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Day 1 — Chișinău to Butuceni via Curchi Monastery" },
        { "@type": "ListItem", "position": 2, "name": "Day 2 — Orheiul Vechi cave monastery and the Nistru river canyon" },
        { "@type": "ListItem", "position": 3, "name": "Day 3 — Saharna waterfalls and return to Chișinău" }
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://moldovamoto.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tours", "item": "https://moldovamoto.com/#tours" },
      { "@type": "ListItem", "position": 3, "name": "3-Day Moldova Adventure",
        "item": "https://moldovamoto.com/tours/3-day-moldova-adventure" }
    ]
  }
];

export default function ThreeDayAdventure() {
  return (
    <PageShell>
      <SeoHead
        title="3-Day Moldova Adventure — Orheiul Vechi & Nistru by Motorcycle | MoldovaMoto"
        description="Three days on a CFMOTO 800MT through Moldova's cliff monasteries, river canyons and vineyard villages. Butuceni guesthouse night included. €650 all-in."
        canonical="https://moldovamoto.com/tours/3-day-moldova-adventure"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>3-Day Tour · Intermediate</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 8px" }}>
          3-Day Moldova Adventure: Orheiul Vechi, Nistru & Saharna
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          The canonical Moldova ride. Cliff monasteries carved into limestone, serpentine river
          roads, a night in a traditional Butuceni guesthouse, and the kind of scenery that
          convinces people Moldova was Europe's secret all along.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, margin: "28px 0", padding: "18px", background: "#111", borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {[
            ["Price",      "€650"],
            ["Duration",   "3 days"],
            ["Distance",   "620 km"],
            ["Difficulty", "Intermediate"],
            ["Group size", "Max 8"],
            ["Bike",       "CFMOTO 800MT"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{k}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>

        <h2>What's included</h2>
        <ul>
          <li>CFMOTO 800MT Adventure with full luggage</li>
          <li>Full riding gear (helmet, jacket, trousers, gloves) — any size</li>
          <li>Experienced local guide (EN/DE) and intercom</li>
          <li>Support van for luggage, tools, and the odd weather detour</li>
          <li>Fuel, insurance, tolls, and all site entries</li>
          <li>Two nights in boutique guesthouses (Butuceni village + Saharna)</li>
          <li>Breakfast, lunch, and dinner every day</li>
          <li>Airport pickup from Chișinău (KIV)</li>
        </ul>

        <h2>The itinerary</h2>
        <h3>Day 1 — Chișinău → Curchi → Butuceni (180 km)</h3>
        <p>Morning briefing at our garage, bike assignment, and we're north by 10:00. We skip the R-14 highway and thread through the back lanes via Peresecina and Curchi, stopping at Curchi Monastery for lunch and the best plăcintă in the region. The approach to Butuceni from the Curchi ridge drops you into the Răut valley with the cliff monastery on the far bank — the best first-impression of any Moldovan site. Check in at the guesthouse, dinner of house-smoked trout and Fetească Neagră.</p>

        <h3>Day 2 — Orheiul Vechi + Nistru canyon (220 km)</h3>
        <p>Early start to beat the tour buses at the cave monastery. Thirty minutes to walk the cliff, then we cross the wooden bridge and ride east along the Nistru river road — one of the most underrated motorcycle roads in Europe. Lunch at a village restaurant in Molovata, swim stop if the weather is warm, and a loop back through the vineyards of Ivancea. Second night in Saharna.</p>

        <h3>Day 3 — Saharna waterfalls → Chișinău (220 km)</h3>
        <p>Morning hike to the Saharna waterfalls (3 km round trip, optional). Riding south through Țipova and Rezina, a long vineyard section through Cricova, and back into Chișinău by 17:00. Group photo, bikes returned, beer on us.</p>

        <h2>Who it's for</h2>
        <ul>
          <li><strong>Riding experience:</strong> Intermediate — 3+ years on an A-category bike, comfortable with 200 km days and some broken tarmac.</li>
          <li><strong>License:</strong> Full category A (or A2 with a restricted bike — ask us). IDP required for non-EU licenses.</li>
          <li><strong>Minimum age:</strong> 21 with 2+ years of A-category riding.</li>
          <li><strong>Languages:</strong> Guide speaks fluent English and German.</li>
          <li><strong>Pillions:</strong> Rider-only on multi-day tours for comfort and luggage capacity.</li>
        </ul>

        <h2>Departure dates</h2>
        <p>We run the 3-Day Adventure twice a month from late April through early October. Private departures for groups of 3+ on request. Book the date on the <Link to="/#tours">tours page</Link>, or message us on WhatsApp for custom routing.</p>
        <Link to="/#tours" style={{ display: "inline-block", marginTop: 14, background: ORANGE, color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 800, fontSize: 15 }}>
          Reserve your date →
        </Link>

        <h2>Frequently asked</h2>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>How hard is the riding, honestly?</summary>
          <p style={{ marginTop: 8 }}>Most of it is paved and flowing. There's one 6 km hardpack gravel stretch along the Nistru on Day 2 that you can skip — we'll re-route the group around it if anyone would rather not. Pace is set by the slowest rider; we don't drop anyone.</p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>What are the guesthouses like?</summary>
          <p style={{ marginTop: 8 }}>Small, family-run, private rooms with ensuite bathrooms. Traditional Moldovan breakfasts. Not five-star — five-star isn't what you came for. Single-supplement €25/night if you'd rather not share.</p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Can I extend it into a longer trip?</summary>
          <p style={{ marginTop: 8 }}>Yes. The 3-Day dovetails with the <Link to="/tours/5-day-grand-moldova">5-Day Grand Tour</Link> and can be paired with a day of wine tasting in Cricova or Purcari — ask when you book.</p>
        </details>
        <p style={{ marginTop: 12 }}>More questions? <Link to="/faq">See the full FAQ</Link>.</p>

        <h2>Related reading</h2>
        <ul>
          <li><Link to="/blog/orheiul-vechi-motorcycle-guide">Orheiul Vechi by motorcycle — route guide</Link></li>
          <li><Link to="/blog/moldova-motorcycle-tour-guide">The complete guide to motorcycle touring in Moldova</Link></li>
          <li><Link to="/adventures">Photos from past 3-Day departures</Link></li>
        </ul>
      </article>
    </PageShell>
  );
}
