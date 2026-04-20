import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";

const { ORANGE, BORDER, MUTED, WHITE } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": "1-Day Wine Ride — Cricova Cellars by Motorcycle",
    "description": "A one-day guided motorcycle tour from Chișinău through Moldova's vineyards into the Cricova underground wine cellars, with lunch at a family winery.",
    "touristType": ["Motorcycling enthusiasts", "Wine enthusiasts", "Adventure travellers"],
    "image": "https://moldovamoto.com/og-cover.jpg",
    "url": "https://moldovamoto.com/tours/1-day-wine-ride",
    "provider": {
      "@type": "Organization",
      "name": "MoldovaMoto",
      "url": "https://moldovamoto.com/"
    },
    "offers": {
      "@type": "Offer",
      "price": "220",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://moldovamoto.com/tours/1-day-wine-ride",
      "validFrom": "2026-04-04"
    },
    "itinerary": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Chișinău garage — briefing and bike assignment" },
        { "@type": "ListItem", "position": 2, "name": "Vineyard back roads (R-14 alternatives)" },
        { "@type": "ListItem", "position": 3, "name": "Cricova Wine Cellars — 120 km underground tour" },
        { "@type": "ListItem", "position": 4, "name": "Family winery lunch with tasting" },
        { "@type": "ListItem", "position": 5, "name": "Return via scenic Nistru viewpoint to Chișinău" }
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://moldovamoto.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tours", "item": "https://moldovamoto.com/#tours" },
      { "@type": "ListItem", "position": 3, "name": "1-Day Wine Ride", "item": "https://moldovamoto.com/tours/1-day-wine-ride" }
    ]
  }
];

export default function WineRide() {
  return (
    <PageShell>
      <SeoHead
        title="1-Day Wine Ride — Moldova Motorcycle Tour | MoldovaMoto"
        description="Ride from Chișinău into Moldova's vineyards, descend into the Cricova underground cellars and lunch at a family winery. CFMOTO 800MT included — €220."
        canonical="https://moldovamoto.com/tours/1-day-wine-ride"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>1-Day Tour · Easy</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 8px" }}>
          1-Day Wine Ride: Cricova Cellars by Motorcycle
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          A single unforgettable day — vineyard back roads out of Chișinău, the legendary Cricova
          underground cellars, and a long lunch at a family winery you could never find alone.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, margin: "28px 0", padding: "18px", background: "#111", borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {[
            ["Price",      "€220"],
            ["Duration",   "~9 hours"],
            ["Distance",   "180 km"],
            ["Difficulty", "Easy"],
            ["Group size", "Max 6"],
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
          <li>CFMOTO 800MT Adventure with ABS, traction control, heated grips</li>
          <li>Full riding gear (helmet, jacket, trousers, gloves) — any size</li>
          <li>Experienced local guide (EN/DE) and intercom</li>
          <li>Fuel, insurance, tolls</li>
          <li>Cricova Wine Cellars guided underground tour + tasting</li>
          <li>Three-course lunch at a family winery with pairings</li>
          <li>Bottle of local wine to take home</li>
        </ul>

        <h2>The route, hour by hour</h2>
        <h3>08:30 — Chișinău garage</h3>
        <p>Coffee, paperwork, a 45-minute safety briefing and we match you to a bike. First-time on a CFMOTO? 20 minutes on the lot until you're comfortable.</p>
        <h3>09:30 — Out of the city on the back roads</h3>
        <p>We skip the R-14 and take a series of vineyard lanes north-west. Empty tarmac, 60–80 km/h, low-traffic sweepers through 20 km of continuous vines.</p>
        <h3>11:00 — Cricova Wine Cellars</h3>
        <p>One of only two wineries in the world large enough to drive through. Our tour goes 80 metres underground into 120 km of tunnels at a constant 12°C. You'll walk, not ride, the cellars — bikes are parked upstairs.</p>
        <h3>13:00 — Family winery lunch</h3>
        <p>A 30-minute ride south to a small estate most guidebooks miss. Three courses paired with their own Fetească Neagră and a Rara Neagră rosé. Plan for a long lunch — you're not in a rush.</p>
        <h3>15:30 — Return via the Nistru viewpoint</h3>
        <p>A scenic detour along the river before looping back into Chișinău. Arrive at the garage around 17:30, bikes returned, group photo, beer on us.</p>

        <h2>About Cricova — why the cellars matter</h2>
        <p>Cricova's cellars were carved out of limestone over two centuries of quarrying. The temperature inside never varies, which is why the winery stores 1.3 million bottles here, including private cellars belonging to heads of state, cosmonauts, and a long list of public figures you'll recognise from the plaques. You don't have to be a wine person for this to feel special; it's closer to catacombs than a cellar door.</p>

        <h2>The motorcycle</h2>
        <p>The CFMOTO 800MT is a touring-class adventure bike — 95 hp, 800 cc parallel-twin, upright ergonomics, ABS with an off-road mode, traction control, cruise control, and heated grips. At 835 mm it's manageable for riders 5'7" and up; we carry a low-seat option too. Panniers + top box come standard.</p>

        <h2>Who it's for</h2>
        <ul>
          <li><strong>Riding experience:</strong> Beginners welcome. Flat tarmac, moderate pace.</li>
          <li><strong>License:</strong> Full category A (or A2 with a restricted bike — ask us). IDP required for non-EU licenses.</li>
          <li><strong>Minimum age:</strong> 21 with 2+ years of A-category riding.</li>
          <li><strong>Languages:</strong> Guide speaks fluent English and German.</li>
          <li><strong>Pillion passengers:</strong> Welcome with full gear and a helmet.</li>
        </ul>

        <h2>Departure dates</h2>
        <p>We run the Wine Ride every Saturday from 4 April through the end of October. Mid-week private departures available for groups of 3+ on request.</p>
        <Link to="/#tours" style={{ display: "inline-block", marginTop: 14, background: ORANGE, color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 800, fontSize: 15 }}>
          Reserve your date →
        </Link>

        <h2>Frequently asked</h2>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>What if I've never ridden in Europe before?</summary>
          <p style={{ marginTop: 8 }}>Perfect — this tour is designed for that. Moldova drives on the right, signage is clear, and our guide sets a pace you're comfortable with.</p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Can I drink at lunch?</summary>
          <p style={{ marginTop: 8 }}>The tastings are small pours — about 30 ml each, similar to any guided wine tour. If you'd rather skip the wine entirely, we'll arrange alcohol-free pairings.</p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>What if it rains?</summary>
          <p style={{ marginTop: 8 }}>We ride unless it's unsafe. Our gear is waterproof and the CFMOTO has heated grips. If storms hit, we'll wait them out with an extra wine at Cricova — no one will complain.</p>
        </details>
        <p style={{ marginTop: 12 }}>More questions? <Link to="/faq">See the full FAQ</Link>.</p>

        <h2>Related reading</h2>
        <ul>
          <li><Link to="/blog/moldova-motorcycle-tour-guide">The complete guide to motorcycle touring in Moldova</Link></li>
          <li><Link to="/blog/orheiul-vechi-motorcycle-guide">Orheiul Vechi by motorcycle — route guide</Link></li>
          <li><Link to="/adventures">Photos from past Wine Ride departures</Link></li>
        </ul>
      </article>
    </PageShell>
  );
}
