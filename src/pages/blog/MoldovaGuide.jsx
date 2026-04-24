import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";

const { ORANGE, BORDER } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Motorcycle Tour of Moldova: The Complete 2026 Ride Guide",
    "description": "Everything you need to ride Moldova: best months, top routes, license rules, border crossings, weather, costs, and the roads locals actually use.",
    "image": "https://moldovamoto.com/og-cover.jpg",
    "author": { "@type": "Organization", "name": "ETI Moto Tours" },
    "publisher": {
      "@type": "Organization",
      "name": "ETI Moto Tours",
      "logo": { "@type": "ImageObject", "url": "https://moldovamoto.com/logo.png" }
    },
    "datePublished": "2026-04-20",
    "dateModified": "2026-04-20",
    "mainEntityOfPage": "https://moldovamoto.com/blog/moldova-motorcycle-tour-guide"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://moldovamoto.com/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://moldovamoto.com/blog" },
      { "@type": "ListItem", "position": 3, "name": "Moldova motorcycle tour guide",
        "item": "https://moldovamoto.com/blog/moldova-motorcycle-tour-guide" }
    ]
  }
];

export default function MoldovaGuide() {
  return (
    <PageShell>
      <SeoHead
        title="Motorcycle Tour of Moldova: The Complete 2026 Ride Guide"
        description="Everything you need to ride Moldova: best months, top routes, license rules, border crossings, weather, costs, and the roads locals actually use."
        canonical="https://moldovamoto.com/blog/moldova-motorcycle-tour-guide"
        ogType="article"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>Guide · 12 min read</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 14px" }}>
          The Complete Guide to Motorcycle Touring in Moldova
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          Moldova is Eastern Europe's last secret: empty tarmac, century-old monasteries carved
          into cliffs, wine cellars the size of small cities, and almost nobody riding it. This is
          the guide we wish we'd had the first time we shipped a bike in.
        </p>

        <h2>Why Moldova</h2>
        <p>If you've ridden the Alps, the Pyrenees, or even Romania's Transfăgărășan, you already know what the problem is: traffic. Moldova is 3.4 million people across a Belgium-sized country; outside Chișinău you can go 40 km without seeing another vehicle. The roads aren't built for tourism, which is exactly the point — you get vineyards, monasteries, limestone canyons, and Soviet villages, threaded together by serpentine back roads no one has blogged about.</p>

        <h2>When to ride</h2>
        <p>Tours run <strong>mid-April through mid-October</strong>. The sweet spots:</p>
        <ul>
          <li><strong>May</strong> — 18–23°C, spring green, empty roads. Our favorite month.</li>
          <li><strong>June</strong> — warm, long days, occasional afternoon storms.</li>
          <li><strong>July–August</strong> — 28–34°C. We start at 07:30 to beat the heat.</li>
          <li><strong>September</strong> — grape harvest, 17–24°C, every winery in full swing.</li>
          <li><strong>October</strong> — golden, cooler mornings (8–12°C), fewer crowds.</li>
        </ul>
        <p>Winter (November–March) is off-season — roads get salted and the lovely gravel connectors turn to mud. Don't bother.</p>

        <h2>Getting there</h2>
        <p>Fly into Chișinău International (<abbr title="Chișinău">KIV</abbr>). Direct flights from Frankfurt, Vienna, Istanbul, London, and several regional European hubs. €5 Uber from the airport to our garage, 25 minutes. Shipping your own bike via ADAC or Knopf works (we've seen it done plenty of times), but unless you're on a multi-country trip it's not worth the hassle — our CFMOTO 800MT fleet covers the same terrain.</p>

        <h2>Licensing & documents for tourists</h2>
        <ul>
          <li>Full category A motorcycle license from your home country.</li>
          <li>Non-EU riders (US, UK post-Brexit, Canada, Australia, etc.) also need an <strong>International Driving Permit</strong>. It's 10 minutes at your national auto club.</li>
          <li>Passport — 90 days visa-free for most Western passports.</li>
          <li>Travel/medical insurance is your responsibility; tour insurance (liability + bike damage) is on us.</li>
        </ul>

        <h2>The signature routes</h2>
        <h3>1-Day Wine Ride — Cricova</h3>
        <p>The classic introduction. 180 km, mostly vineyards, cellar visit and winery lunch. Beginner-friendly. <Link to="/tours/1-day-wine-ride">Tour details</Link>.</p>
        <h3>3-Day Moldova Adventure — Orheiul Vechi + Nistru</h3>
        <p>Cliff monasteries carved into limestone, winding river roads, a night in a village guesthouse. The canonical Moldova ride. Intermediate. <Link to="/tours/3-day-moldova-adventure">Tour details</Link>.</p>
        <h3>5-Day Grand Moldova Tour — full country traverse</h3>
        <p>North to south: Soroca fortress on the Ukrainian border, Saharna waterfalls, Purcari winery, Bender fortress. Includes a 20 km hardpack gravel section. Advanced. <Link to="/tours/5-day-grand-moldova">Tour details</Link>.</p>
        <h3>Open-date motorcycle rental</h3>
        <p>CFMOTO 800MT with luggage for €120/day. Route briefing on request (€80) with GPX files. For self-guided riders who want to explore on their own pace.</p>

        <h2>Guided vs. self-guided</h2>
        <p>Guided wins for first-timers: the routes include village back roads that never show up on Google Maps, our support van handles luggage and mechanical issues, and the local guide gets you into wineries/monasteries that don't appear in guidebooks. Self-guided wins if you've already ridden Eastern Europe and want freedom — we'll hand you the GPX, the keys, and get out of your way.</p>

        <h2>The bike — why CFMOTO 800MT</h2>
        <p>We chose the CFMOTO 800MT because it sits in the sweet spot for Moldova's mix of surfaces: 800 cc parallel-twin, 95 hp, ABS, traction control, cruise, heated grips. 19" front wheel for the hardpack sections. 835 mm seat height (low-seat option available). Fuel range ~350 km. Comfortable for 300 km days without hotel-stop fatigue. The alternatives we considered and rejected: Tiger 900 (too tall for mixed-height riders), BMW F850 GS (parts-availability hassle), KTM 890 Adventure (too aggressive for beginners).</p>

        <h2>Costs — an honest breakdown</h2>
        <ul>
          <li>Guided day tour: €220 (all-in)</li>
          <li>Guided 3-day: €650 (all-in)</li>
          <li>Guided 5-day: €1,050 (all-in)</li>
          <li>Self-guided rental: €120/day, €80 briefing</li>
          <li>Single-room supplement on multi-day tours: €25/night</li>
          <li>Tips (optional, appreciated): 5–10% of tour price</li>
          <li>Beers you'll buy the guide: budget €15</li>
        </ul>

        <h2>Safety, roads, and what to expect</h2>
        <p>Main highways (M1, M2, M3) are good tarmac. Secondary roads vary from excellent to Soviet-era potholed — we know which ones to avoid. Livestock on rural roads is real; you'll slow-ride past a herd at least once. Drivers in Moldova are more cautious than Italy or France; lane discipline is imperfect but aggression is low. Speed enforcement exists but not stings-on-straightaways; stay reasonable and you'll be fine.</p>

        <h2>Packing list</h2>
        <ul>
          <li>Riding boots (over the ankle)</li>
          <li>Base layers — merino wool is ideal</li>
          <li>Thermal mid-layer for spring/autumn mornings</li>
          <li>Waterproof shell (we provide a riding jacket, but a rain overjacket is useful)</li>
          <li>Sunglasses + sunscreen</li>
          <li>Universal EU plug adapter</li>
          <li>Passport, license, IDP, insurance copies</li>
          <li>Any prescription meds — pharmacies in villages are limited</li>
        </ul>

        <h2>Border crossings</h2>
        <p>Romania (EU) is the most common neighbor and painless to cross if you need to. Ukraine is not advised — skip it. <strong>Transnistria</strong> is a self-declared breakaway region along the east — our routes stay in government-controlled territory because Transnistria crossings void most insurance policies.</p>

        <h2>Language, payments, Wi-Fi</h2>
        <p>Romanian and Russian both widely spoken; English at hotels and in Chișinău, patchy in villages. Your card works at most restaurants and hotels in the capital; keep €50 in leu for village stops. 4G coverage is Europe-wide-good — you can video-call home from any viewpoint.</p>

        <h2>Plan your trip</h2>
        <ul>
          <li><strong>Got a Saturday?</strong> <Link to="/tours/1-day-wine-ride">1-Day Wine Ride →</Link></li>
          <li><strong>Got a long weekend?</strong> <Link to="/tours/3-day-moldova-adventure">3-Day Moldova Adventure →</Link></li>
          <li><strong>Got a week?</strong> <Link to="/tours/5-day-grand-moldova">5-Day Grand Moldova Tour →</Link> plus a day of recovery.</li>
          <li><strong>Rider who prefers solo?</strong> Open-date rental — we'll hand you the GPX.</li>
        </ul>

        <h2>Related reading</h2>
        <ul>
          <li><Link to="/blog/orheiul-vechi-motorcycle-guide">Orheiul Vechi by motorcycle — the back-road route guide</Link></li>
          <li><Link to="/faq">Full rider FAQ — license, insurance, cancellation, weather</Link></li>
          <li><Link to="/adventures">Photos from past tours</Link></li>
        </ul>
      </article>
    </PageShell>
  );
}
