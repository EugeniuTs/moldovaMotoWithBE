import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";

const { ORANGE, BORDER } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Orheiul Vechi by Motorcycle: Route, Tips & What to Expect",
    "description": "How to ride from Chișinău to Orheiul Vechi — the best road, where to park, the cave monastery timing, food stops and what not to miss.",
    "image": "https://moldovamoto.com/og-cover.jpg",
    "author":    { "@type": "Organization", "name": "MoldovaMoto" },
    "publisher": { "@type": "Organization", "name": "MoldovaMoto",
      "logo": { "@type": "ImageObject", "url": "https://moldovamoto.com/logo.png" } },
    "datePublished": "2026-04-20",
    "dateModified":  "2026-04-20",
    "mainEntityOfPage": "https://moldovamoto.com/blog/orheiul-vechi-motorcycle-guide",
    "about": {
      "@type": "TouristAttraction",
      "name": "Orheiul Vechi",
      "description": "A limestone canyon cave-monastery complex along the Răut River in Moldova.",
      "geo": { "@type": "GeoCoordinates", "latitude": 47.3047, "longitude": 28.9572 }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://moldovamoto.com/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://moldovamoto.com/blog" },
      { "@type": "ListItem", "position": 3, "name": "Orheiul Vechi motorcycle guide",
        "item": "https://moldovamoto.com/blog/orheiul-vechi-motorcycle-guide" }
    ]
  }
];

export default function OrheiulVechi() {
  return (
    <PageShell>
      <SeoHead
        title="Orheiul Vechi by Motorcycle: Route, Tips & What to Expect"
        description="How to ride from Chișinău to Orheiul Vechi — the best road, where to park, the cave monastery timing, food stops and what not to miss."
        canonical="https://moldovamoto.com/blog/orheiul-vechi-motorcycle-guide"
        ogType="article"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>Ride guide · 8 min read</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 14px" }}>
          Riding to Orheiul Vechi: Moldova's Cliff Monastery by Motorcycle
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          Orheiul Vechi is what you come to Moldova for — an ancient cave monastery dug into a
          limestone canyon, overlooking a river bend you'd swear was scenery from a film set. This
          is how to ride there, where to park, and the back road most GPS apps miss.
        </p>

        <h2>Orheiul Vechi in one paragraph</h2>
        <p>Orheiul Vechi (literally "Old Orhei") is a complex of ruins, monasteries, and villages on a bend of the Răut River, 60 km north of Chișinău. A cave church was carved into the cliff here in the 13th century; monks still use it. The site is on UNESCO's tentative list. It's also Moldova's single most photographed place — which is why you should go either first thing in the morning or late afternoon.</p>

        <h2>The ride — R-14 vs. the back road</h2>
        <p>Google Maps sends you out on the R-14 (highway through Orhei town). That works, but it's boring — 80 km/h straightaways and a lot of trucks. The local route threads through the villages of Peresecina, Curchi, and Butuceni. Twice the twisties, almost zero traffic, and you get to approach Orheiul Vechi from the canyon side, which is the dramatic approach.</p>

        <blockquote>Coming out of Curchi, the road drops into the Răut valley and Butuceni suddenly appears below you — whitewashed cottages along the river, the canyon on the far bank. It's the single best approach to any Moldovan site. Pull over at the crest.</blockquote>

        <h2>Turn-by-turn route</h2>
        <ol>
          <li><strong>Chișinău</strong> → north on M2 for 20 km</li>
          <li>Exit at <strong>Peresecina</strong> — take the unmarked lane east, towards Curchi</li>
          <li><strong>Curchi Monastery</strong> — coffee stop at the monastery guesthouse (they do an excellent plăcintă)</li>
          <li>Continue east 8 km to <strong>Butuceni</strong> — viewpoint on the right</li>
          <li>Descend into the village, cross the wooden bridge, park at Orheiul Vechi visitor center</li>
          <li>Walk up to the cave monastery (10 min uphill)</li>
        </ol>
        <p><strong>GPX file:</strong> available on request — email us or join a guided departure and we'll send it.</p>

        <h2>Where to park</h2>
        <p>There's a gravel lot at the base of the cliff, next to the visitor center — coordinates <code>47.3047, 28.9572</code>. Bring a disc lock. Helmets and jackets fit in the visitor center lockers for a small tip. Take wallets, phones, and documents with you; the lot is generally quiet but it's unattended, so don't treat panniers as a safe.</p>

        <h2>The cave monastery — what to know</h2>
        <ul>
          <li><strong>Hours:</strong> 09:00–17:00, every day. Longer in summer.</li>
          <li><strong>Dress code:</strong> knees and shoulders covered. They lend wraps at the entrance.</li>
          <li><strong>Donation:</strong> 20 MDL (about €1). Cash.</li>
          <li><strong>Photography:</strong> outside yes, inside the chapel only with permission.</li>
          <li><strong>Crowds:</strong> empty before 10:00 and after 15:30. Pilgrimage Sundays (Easter, Assumption) — avoid.</li>
        </ul>

        <h2>The Butuceni village loop</h2>
        <p>Most visitors see the cave and leave. Don't. Ride 3 km further down the valley through Butuceni — traditional cottages, a restored wooden church, and a dirt track that loops back along the river. <strong>La Butuceni</strong> is the family restaurant we always stop at: mămăligă with sheep cheese, house-smoked trout from the Răut, and a carafe of their own wine for €12.</p>

        <h2>Photography notes</h2>
        <p>Golden hour over the canyon (approx 19:30 in summer, 17:00 in autumn) is when the cliff glows orange. The best shot is from the viewpoint on the far bank — turn off the Curchi road at the crest, park, walk 50 m. Drones are tolerated but avoid the cave entrance.</p>

        <h2>Extend the ride</h2>
        <p>Three good loops off Orheiul Vechi, all rideable the same day:</p>
        <ul>
          <li><strong>Saharna waterfalls</strong> — 50 km further north. Small gorge, monastery, a 3 km walk.</li>
          <li><strong>Curchi Monastery (full tour)</strong> — back through Peresecina via the ridge road.</li>
          <li><strong>Return through Piatra</strong> — southern loop with empty tarmac along vineyards.</li>
        </ul>

        <h2>When to go</h2>
        <p>Best conditions May–June and September–early October. Avoid religious holidays (tour buses). Weekdays always beat weekends. Rain days make the canyon paths slick but the ride itself stays rideable — just skip the dirt Butuceni loop.</p>

        <h2>Ride it with a guide</h2>
        <p>Our <strong>3-Day Moldova Adventure</strong> includes Orheiul Vechi plus Saharna, Curchi, and a night in a Butuceni guesthouse — the overnight is what turns this from a day trip into a proper weekend. <Link to="/tours/3-day-moldova-adventure">See the 3-Day Adventure →</Link></p>

        <h2>Related reading</h2>
        <ul>
          <li><Link to="/blog/moldova-motorcycle-tour-guide">The complete guide to motorcycle touring in Moldova</Link></li>
          <li><Link to="/tours/1-day-wine-ride">1-Day Wine Ride — if you'd rather do vineyards first</Link></li>
          <li><Link to="/faq">Rider FAQ — license, weather, insurance</Link></li>
        </ul>
      </article>
    </PageShell>
  );
}
