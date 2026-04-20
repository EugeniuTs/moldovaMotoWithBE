import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";

const { ORANGE, BORDER, MUTED, WHITE } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": "5-Day Grand Moldova Tour — Soroca, Nistru & Purcari by Motorcycle",
    "description": "A five-day guided motorcycle traverse of Moldova from the medieval fortress of Soroca on the Ukrainian border south to the vineyards of Purcari, including the Nistru canyon, Bender fortress and hardpack gravel connectors.",
    "touristType": ["Motorcycling enthusiasts", "Adventure travellers", "Wine enthusiasts"],
    "image": "https://moldovamoto.com/og-cover.jpg",
    "url": "https://moldovamoto.com/tours/5-day-grand-moldova",
    "provider": {
      "@type": "Organization",
      "name": "MoldovaMoto",
      "url": "https://moldovamoto.com/"
    },
    "offers": {
      "@type": "Offer",
      "price": "1050",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://moldovamoto.com/tours/5-day-grand-moldova",
      "validFrom": "2026-04-04"
    },
    "itinerary": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Day 1 — Chișinău to Orheiul Vechi and Butuceni" },
        { "@type": "ListItem", "position": 2, "name": "Day 2 — Saharna waterfalls and north to Soroca fortress" },
        { "@type": "ListItem", "position": 3, "name": "Day 3 — Soroca to the Nistru canyon and Rezina" },
        { "@type": "ListItem", "position": 4, "name": "Day 4 — South through Bender fortress to Purcari vineyards" },
        { "@type": "ListItem", "position": 5, "name": "Day 5 — Purcari to Chișinău via the Prut valley" }
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://moldovamoto.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tours", "item": "https://moldovamoto.com/#tours" },
      { "@type": "ListItem", "position": 3, "name": "5-Day Grand Moldova Tour",
        "item": "https://moldovamoto.com/tours/5-day-grand-moldova" }
    ]
  }
];

export default function FiveDayGrand() {
  return (
    <PageShell>
      <SeoHead
        title="5-Day Grand Moldova Tour — Full Country by Motorcycle | MoldovaMoto"
        description="North to south across Moldova on a CFMOTO 800MT: Soroca fortress, the Nistru canyon, Bender, Purcari vineyards. Five riding days, four nights, €1,050 all-in."
        canonical="https://moldovamoto.com/tours/5-day-grand-moldova"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>5-Day Tour · Advanced</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 8px" }}>
          5-Day Grand Moldova Tour: North to South
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          The full traverse. A medieval Genoese fortress on the Ukrainian border, 140 km of
          empty tarmac along the Nistru, a 20 km hardpack gravel connector, and a final night
          among the Purcari vineyards. If you've got a week in Europe and know how to ride,
          this is the trip.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, margin: "28px 0", padding: "18px", background: "#111", borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {[
            ["Price",      "€1,050"],
            ["Duration",   "5 days"],
            ["Distance",   "1,180 km"],
            ["Difficulty", "Advanced"],
            ["Group size", "Max 5"],
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
          <li>Dedicated support van — luggage, tools, spare bike on standby</li>
          <li>Fuel, insurance, tolls, and all site entries</li>
          <li>Four nights in boutique guesthouses and one winery stay in Purcari</li>
          <li>Breakfast, lunch, and dinner every day</li>
          <li>Cricova cellar tour + Purcari winery tasting</li>
          <li>Airport pickup and drop-off from Chișinău (KIV)</li>
        </ul>

        <h2>The itinerary</h2>
        <h3>Day 1 — Chișinău → Orheiul Vechi → Butuceni (190 km)</h3>
        <p>Morning briefing, bike assignment, and a warm-up ride through the Peresecina back roads to Curchi Monastery. Cave monastery at Orheiul Vechi in the quiet afternoon light, then we drop into Butuceni for the night. House-smoked trout, Fetească Neagră, and an early turn-in — tomorrow is the long day.</p>

        <h3>Day 2 — Saharna → Soroca fortress (260 km)</h3>
        <p>North via the Saharna waterfalls (short hike), then the Nistru road to the Genoese-era fortress at Soroca on the Ukrainian border. The fortress is intact, compact, and genuinely medieval — not a reconstruction. Overnight in a riverside guesthouse.</p>

        <h3>Day 3 — Soroca → Rezina → Nistru canyon (220 km)</h3>
        <p>The big ride. 140 km along the Nistru river on some of the emptiest paved roads in Europe, plus a 20 km hardpack gravel connector through the Țipova gorge — this is the technical section that earns the tour its "advanced" label. Lunch at a village restaurant, swim stop at a clifftop bend, overnight in a Rezina guesthouse.</p>

        <h3>Day 4 — Rezina → Bender → Purcari vineyards (290 km)</h3>
        <p>South through the rolling agricultural heartland, past Bender fortress (Ottoman-era, on the edge of Transnistria but on the government-controlled side — we don't cross). Arrive at the Purcari wine estate in the late afternoon for a cellar tour, tasting of their Negru de Purcari and Freedom Blend, and dinner in the estate restaurant.</p>

        <h3>Day 5 — Purcari → Chișinău via Prut valley (220 km)</h3>
        <p>A relaxed final day — the Prut valley along the Romanian border, a stop at Cricova cellars (because you can't leave Moldova without seeing them), and back to Chișinău by 17:00. Group photo, bikes returned, farewell dinner on us.</p>

        <h2>Who it's for</h2>
        <ul>
          <li><strong>Riding experience:</strong> Advanced — 250–300 km days, one 20 km hardpack gravel section, summer heat. You should have ridden hardpack before.</li>
          <li><strong>License:</strong> Full category A. IDP required for non-EU licenses.</li>
          <li><strong>Minimum age:</strong> 25, or 21 with a €150 young-rider surcharge (insurance cost).</li>
          <li><strong>Languages:</strong> Guide speaks fluent English and German.</li>
          <li><strong>Pillions:</strong> Rider-only. Distances are too long for a comfortable pillion experience.</li>
        </ul>

        <h2>Why small groups</h2>
        <p>We cap the 5-Day at five riders because the gravel section, the mountain passes, and the border-region roads all work better with a compact group. Two guides, a support van, and five riders means nobody gets dropped, nobody waits two hours for a bathroom break, and photo stops happen when you ask — not on a schedule.</p>

        <h2>Departure dates</h2>
        <p>Four scheduled departures per season: early May, mid-June, early September, early October. Private departures for groups of 3+ on request. Book via the <Link to="/#tours">tours page</Link> or message us on WhatsApp.</p>
        <Link to="/#tours" style={{ display: "inline-block", marginTop: 14, background: ORANGE, color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 800, fontSize: 15 }}>
          Reserve your date →
        </Link>

        <h2>Frequently asked</h2>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Do we cross into Ukraine or Transnistria?</summary>
          <p style={{ marginTop: 8 }}>No. The route stays entirely in government-controlled Moldova. Soroca fortress and Bender are both on the Moldovan side — we view the Ukrainian bank of the Nistru from our side, nothing more.</p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>How technical is the gravel section?</summary>
          <p style={{ marginTop: 8 }}>Hardpack, not loose. The CFMOTO's 19-inch front wheel and off-road ABS mode handle it easily. If you've ridden forest roads or unpaved passes before, you'll be comfortable. If you haven't, we'll brief you the morning of and the support van follows the section.</p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>What if I can't do the gravel?</summary>
          <p style={{ marginTop: 8 }}>We have a bypass road that adds 30 km of tarmac. You ride it with one of the two guides while the rest take the gravel. Nobody is made to ride something they don't want to.</p>
        </details>
        <p style={{ marginTop: 12 }}>More questions? <Link to="/faq">See the full FAQ</Link>.</p>

        <h2>Related reading</h2>
        <ul>
          <li><Link to="/blog/moldova-motorcycle-tour-guide">The complete guide to motorcycle touring in Moldova</Link></li>
          <li><Link to="/tours/3-day-moldova-adventure">3-Day Moldova Adventure — if five days is too much</Link></li>
          <li><Link to="/adventures">Photos from past Grand Tour departures</Link></li>
        </ul>
      </article>
    </PageShell>
  );
}
