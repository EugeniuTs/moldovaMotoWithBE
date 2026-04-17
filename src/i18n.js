/**
 * i18n.js - EN/DE translations for MoldovaMoto
 * Security: getLang() strips all non-a-z chars and validates against
 * SUPPORTED list. The lang value never touches SQL or any server.
 */
import { useState, useEffect } from "react";

const SUPPORTED = ["en", "de"];

export function getLang() {
  const raw  = new URLSearchParams(window.location.search).get("lang") || "";
  const safe = raw.replace(/[^a-z]/g, "").slice(0, 5);
  return SUPPORTED.includes(safe) ? safe : "en";
}

export function setLang(lang) {
  const safe = SUPPORTED.includes(lang) ? lang : "en";
  const url  = new URL(window.location.href);
  safe === "en" ? url.searchParams.delete("lang")
                : url.searchParams.set("lang", safe);
  window.history.replaceState({}, "", url.toString());
  window.dispatchEvent(new Event("langchange"));
}

export function useLang() {
  const [lang, setLangState] = useState(getLang);
  useEffect(() => {
    const h = () => setLangState(getLang());
    window.addEventListener("langchange", h);
    return () => window.removeEventListener("langchange", h);
  }, []);
  const t = (key) => T[key]?.[lang] ?? T[key]?.["en"] ?? key;
  return { lang, setLang, t };
}

/* ── Translations ─────────────────────────────────────────────────────────── */
const T = {
  // Nav
  "nav.tours":      { en:"Tours",          de:"Touren" },
  "nav.experience": { en:"Experience",     de:"Erlebnis" },
  "nav.fleet":      { en:"Fleet",          de:"Flotte" },
  "nav.routes":     { en:"Routes",         de:"Routen" },
  "nav.contact":    { en:"Contact",        de:"Kontakt" },
  "nav.adventures": { en:"Adventures",     de:"Abenteuer" },
  "nav.book":       { en:"Book Your Tour", de:"Tour buchen" },

  // Hero
  "hero.badge": { en:"Guided Tours \u00B7 Moldova \u00B7 Eastern Europe",
                  de:"Gef\u00FChrte Touren \u00B7 Moldau \u00B7 Osteuropa" },
  "hero.h1a":   { en:"Discover Moldova",   de:"Entdecken Sie Moldau" },
  "hero.h1b":   { en:"on Two Wheels",      de:"auf zwei R\u00E4dern" },
  "hero.sub":   { en:"Ride the last untamed roads of Europe. Expert-guided motorcycle tours through vineyards, cliff monasteries, and river canyons.",
                  de:"Fahren Sie auf den letzten wilden Stra\u00DFen Europas. Expertengeführte Motorradtouren durch Weinberge, Felsenkl\u00F6ster und Flussschluchten." },
  "hero.cta":   { en:"Book Your Tour",     de:"Tour buchen" },
  "hero.stat.riders": { en:"riders guided",    de:"gef\u00FChrte Fahrer" },
  "hero.stat.rating": { en:"avg. rating",      de:"\u00D8 Bewertung" },
  "hero.stat.routes": { en:"signature routes", de:"Signature-Routen" },
  "hero.stat.season": { en:"riding season",    de:"Fahrsaison" },

  // Tours
  "tours.tag":  { en:"Guided Tours",           de:"Gef\u00FChrte Touren" },
  "tours.h2":   { en:"Choose Your Adventure",  de:"W\u00E4hlen Sie Ihr Abenteuer" },
  "tours.sub":  { en:"Every route personally tested by our team for the perfect mix of scenery, culture, and riding joy.",
                  de:"Jede Route wurde von unserem Team pers\u00F6nlich getestet \u2013 f\u00FCr die perfekte Mischung aus Landschaft, Kultur und Fahrfreude." },
  "tours.book": { en:"Book This Tour",         de:"Jetzt buchen" },
  "tours.rental.book": { en:"Rent a Bike",     de:"Motorrad mieten" },
  "tours.spots":  { en:"spots left",           de:"Pl\u00E4tze frei" },
  "tours.full":   { en:"Full",                 de:"Ausgebucht" },
  "tours.departs":{ en:"Departs",              de:"Abfahrt" },

  // Experience
  "exp.tag":  { en:"Why Ride With Us",     de:"Warum mit uns fahren" },
  "exp.h2a":  { en:"Not Just a Tour.",     de:"Nicht nur eine Tour." },
  "exp.h2b":  { en:"An Experience.",       de:"Ein Erlebnis." },

  // Fleet
  "fleet.tag":         { en:"Your Ride Awaits",   de:"Ihr Motorrad wartet" },
  "fleet.h2a":         { en:"CFMOTO 800MT",        de:"CFMOTO 800MT" },
  "fleet.h2b":         { en:"Adventure Class",     de:"Adventure-Klasse" },
  "fleet.desc":        { en:"The CFMOTO 800MT is our chosen mount for Moldova\u2019s diverse terrain \u2014 from smooth vineyard lanes to the rugged riverside tracks of the Nistru canyon. Powerful, comfortable, and loaded with touring tech.",
                         de:"Die CFMOTO 800MT ist unser Motorrad f\u00FCr Moldaus vielf\u00E4ltiges Gel\u00E4nde \u2013 von glatten Weinbergstra\u00DFen bis zu den rauen Flusswegen des Nistru-Canyons. Leistungsstark, komfortabel und mit modernster Touring-Technik." },
  "fleet.badge.title": { en:"All-Inclusive",       de:"Alles inklusive" },
  "fleet.badge.sub":   { en:"Extra Bike Fee",       de:"Aufpreis Motorrad" },

  // Map
  "map.tag":      { en:"The Moldova Map",           de:"Die Moldau-Karte" },
  "map.h2a":      { en:"Six Stops.",                de:"Sechs Stopps." },
  "map.h2b":      { en:"One Unforgettable Journey", de:"Eine unvergessliche Reise" },
  "map.coverage": { en:"Tour Coverage",             de:"Tourenabdeckung" },

  // Contact
  "contact.tag":    { en:"Get in Touch",    de:"Kontakt aufnehmen" },
  "contact.h2":     { en:"Ready to Ride?", de:"Bereit zu fahren?" },
  "contact.sub":    { en:"Have questions? Want a custom itinerary? Drop us a message and we\u2019ll get back to you within a few hours.",
                      de:"Haben Sie Fragen oder m\u00F6chten Sie eine individuelle Route? Schreiben Sie uns \u2013 wir antworten innerhalb weniger Stunden." },
  "contact.name":   { en:"Your Name",      de:"Ihr Name" },
  "contact.email":  { en:"Email Address",  de:"E-Mail-Adresse" },
  "contact.msg":    { en:"Your Message",   de:"Ihre Nachricht" },
  "contact.send":   { en:"Send Message",   de:"Nachricht senden" },
  "contact.sent.h": { en:"Message Sent!",  de:"Nachricht gesendet!" },
  "contact.sent.p": { en:"Thank you! We\u2019ll be in touch within 24 hours.",
                      de:"Vielen Dank! Wir melden uns innerhalb von 24 Stunden." },
  "contact.wa":     { en:"WhatsApp us for faster confirmation: ",
                      de:"Schreiben Sie uns auf WhatsApp: " },

  // Testimonials
  "testi.tag": { en:"Rider Stories",     de:"Fahrer-Erfahrungen" },
  "testi.h2a": { en:"Don\u2019t Take",   de:"Glauben Sie" },
  "testi.h2b": { en:"Our Word For It",   de:"nicht nur uns" },

  // CTA
  "cta.h2a":  { en:"The Road Is Waiting.",   de:"Die Stra\u00DFe wartet." },
  "cta.h2b":  { en:"Are You?",               de:"Sind Sie bereit?" },
  "cta.sub":  { en:"Limited spots per departure. Secure your place on Moldova\u2019s most iconic motorcycle journey.",
                de:"Begrenzte Pl\u00E4tze pro Abfahrt. Sichern Sie sich Ihren Platz auf Moldaus ikonischster Motorradreise." },
  "cta.btn":  { en:"Book Your Tour Now",     de:"Jetzt Tour buchen" },

  // Footer
  "footer.tagline":      { en:"The last untamed roads of Europe.",    de:"Die letzten wilden Stra\u00DFen Europas." },
  "footer.info.about":   { en:"About Us",          de:"\u00DCber uns" },
  "footer.info.fleet":   { en:"Our Fleet",          de:"Unsere Flotte" },
  "footer.info.routes":  { en:"Route Map",          de:"Routenkarte" },
  "footer.info.safety":  { en:"Safety & Licensing", de:"Sicherheit & Lizenz" },
  "footer.info.faq":     { en:"FAQ",                de:"FAQ" },
  "footer.info.terms":   { en:"Terms & Conditions", de:"AGB" },
  "footer.copy":         { en:"All rights reserved.", de:"Alle Rechte vorbehalten." },

  // Booking modal
  "book.badge":  { en:"Reservation Request", de:"Buchungsanfrage" },
  "book.title":  { en:"Book Your Tour",      de:"Tour buchen" },
  "book.s0.q":   { en:"Which tour calls to you?", de:"Welche Tour interessiert Sie?" },
  "book.s1.q":   { en:"Choose your departure",    de:"Abfahrtsdatum w\u00E4hlen" },
  "book.s1.from":{ en:"From",   de:"Von" },
  "book.s1.to":  { en:"To",     de:"Bis" },
  "book.s1.spots":{ en:"spots", de:"Pl\u00E4tze" },
  "book.s1.full": { en:"Full",  de:"Ausgebucht" },
  "book.s1.none": { en:"No upcoming departures scheduled. Please contact us for custom dates.",
                    de:"Keine Abfahrten geplant. Bitte kontaktieren Sie uns f\u00FCr individuelle Termine." },
  "book.s2.q":       { en:"Choose Your Ride",   de:"W\u00E4hlen Sie Ihr Motorrad" },
  "book.s2.avail":   { en:"Available",          de:"Verf\u00FCgbar" },
  "book.s2.booked":  { en:"Booked",             de:"Gebucht" },
  "book.s2.maint":   { en:"Maintenance",        de:"Wartung" },
  "book.s2.select":  { en:"Select",             de:"W\u00E4hlen" },
  "book.s2.selected":{ en:"Selected",           de:"Ausgew\u00E4hlt" },
  "book.s2.conflict":{ en:"This motorcycle is already booked for the selected dates \u2014 please choose a different motorcycle.",
                       de:"Dieses Motorrad ist f\u00FCr die gew\u00E4hlten Daten bereits gebucht \u2013 bitte w\u00E4hlen Sie ein anderes Motorrad." },
  "book.s2.skip":    { en:"Skip \u2014 assign best available bike",
                       de:"\u00DCberspringen \u2013 bestes verf\u00FCgbares Motorrad zuweisen" },
  "book.s3.q":       { en:"Your Rider Profile",  de:"Ihr Fahrerprofil" },
  "book.s3.name":    { en:"FULL NAME",            de:"VOLLST\u00C4NDIGER NAME" },
  "book.s3.email":   { en:"EMAIL ADDRESS",        de:"E-MAIL-ADRESSE" },
  "book.s3.phone":   { en:"PHONE / WHATSAPP",     de:"TELEFON / WHATSAPP" },
  "book.s3.country": { en:"COUNTRY",              de:"LAND" },
  "book.s3.exp":     { en:"RIDING EXPERIENCE",    de:"FAHRERFAHRUNG" },
  "book.s3.exp.beginner":          { en:"Beginner",     de:"Anf\u00E4nger" },
  "book.s3.exp.beginner.sub":      { en:"1-3 years",    de:"1-3 Jahre" },
  "book.s3.exp.intermediate":      { en:"Intermediate", de:"Fortgeschritten" },
  "book.s3.exp.intermediate.sub":  { en:"3-7 years",    de:"3-7 Jahre" },
  "book.s3.exp.advanced":          { en:"Advanced",     de:"Erfahren" },
  "book.s3.exp.advanced.sub":      { en:"7+ years",     de:"7+ Jahre" },
  "book.s3.exp.expert":            { en:"Expert",       de:"Experte" },
  "book.s3.exp.expert.sub":        { en:"Track exp.",   de:"Rennerfahrung" },
  "book.s4.q":       { en:"Confirm Your Booking", de:"Buchung best\u00E4tigen" },
  "book.s4.summary": { en:"Booking Summary",      de:"Buchungs\u00FCbersicht" },
  "book.s4.tour":    { en:"Tour",       de:"Tour" },
  "book.s4.date":    { en:"Date",       de:"Datum" },
  "book.s4.moto":    { en:"Motorcycle", de:"Motorrad" },
  "book.s4.rider":   { en:"Rider",      de:"Fahrer" },
  "book.s4.email":   { en:"Email",      de:"E-Mail" },
  "book.s4.phone":   { en:"Phone",      de:"Telefon" },
  "book.s4.country": { en:"Country",    de:"Land" },
  "book.s4.exp":     { en:"Experience", de:"Erfahrung" },
  "book.s4.license": { en:"I confirm I hold a valid motorcycle license and accept the",
                       de:"Ich best\u00E4tige, einen g\u00FCltigen Motorradführerschein zu besitzen und die" },
  "book.s4.terms":   { en:"terms & conditions", de:"AGB" },
  "book.s4.confirm": { en:"Send Reservation Request \u2713", de:"Buchungsanfrage senden \u2713" },
  "book.s4.sending": { en:"Booking...",           de:"Wird gesendet..." },
  "book.done.h":     { en:"You\u2019re In the Queue!",  de:"Sie sind dabei!" },
  "book.done.p1":    { en:"Your reservation request for", de:"Ihre Buchungsanfrage f\u00FCr" },
  "book.done.p2":    { en:"has been received. We\u2019ll confirm within 24\u00A0hours via email to",
                       de:"ist eingegangen. Wir best\u00E4tigen innerhalb von 24\u00A0Stunden per E-Mail an" },
  "book.done.wa":    { en:"WhatsApp us for faster confirmation:",
                       de:"Schreiben Sie uns auf WhatsApp f\u00FCr schnellere Best\u00E4tigung:" },
  "book.done.back":  { en:"Back to Tours", de:"Zur\u00FCck zu den Touren" },
  "book.btn.back":   { en:"Back",          de:"Zur\u00FCck" },
  "book.btn.next":   { en:"Continue",      de:"Weiter" },

  // Validation
  "err.tour":      { en:"Please select a tour",               de:"Bitte w\u00E4hlen Sie eine Tour" },
  "err.date":      { en:"Please select a departure date",     de:"Bitte w\u00E4hlen Sie ein Abfahrtsdatum" },
  "err.dateOpen":  { en:"Please pick a start date",          de:"Bitte w\u00E4hlen Sie ein Startdatum" },
  "err.dateTo":    { en:"Please pick an end date",           de:"Bitte w\u00E4hlen Sie ein Enddatum" },
  "err.dateRange": { en:"End date must be after start date", de:"Das Enddatum muss nach dem Startdatum liegen" },
  "err.name":      { en:"Name required",                     de:"Name erforderlich" },
  "err.email":     { en:"Valid email required",              de:"G\u00FCltige E-Mail erforderlich" },
  "err.phone":     { en:"Phone required",                    de:"Telefonnummer erforderlich" },
  "err.country":   { en:"Country required",                  de:"Land erforderlich" },
  "err.exp":       { en:"Please select experience level",    de:"Bitte w\u00E4hlen Sie Ihr Erfahrungsniveau" },
  "err.license":   { en:"Please confirm your license",       de:"Bitte best\u00E4tigen Sie Ihren F\u00FChrerschein" },

  // Info page
  "info.back":        { en:"\u2190 MoldovaMoto",       de:"\u2190 MoldovaMoto" },
  "info.book":        { en:"Book a Tour",              de:"Tour buchen" },
  "info.ready":       { en:"Ready to ride?",           de:"Bereit zu fahren?" },
  "info.about.tag":   { en:"Our Story",                de:"Unsere Geschichte" },
  "info.about.h1a":   { en:"The Last Authentic",       de:"Die letzten authentischen" },
  "info.about.h1b":   { en:"Roads of Europe",          de:"Stra\u00DFen Europas" },
  "info.about.lead":  { en:"Moldova Moto Tours was created for riders who want to discover one of the last genuinely untouched regions of Europe - not a postcard version of it, but the real thing.",
                        de:"Moldova Moto Tours wurde f\u00FCr Fahrer gegr\u00FCndet, die eine der letzten wirklich unber\u00FChrten Regionen Europas entdecken m\u00F6chten \u2013 nicht die Hochglanzversion, sondern das echte Moldau." },
  "info.about.do.title":      { en:"What We Do",    de:"Was wir tun" },
  "info.about.do.body":       { en:"We organise motorcycle tours and rentals through Moldova's hidden roads, authentic villages, vineyard landscapes, and wild river canyons.",
                                 de:"Wir organisieren Motorradtouren und -vermietungen durch Moldaus versteckte Stra\u00DFen, authentische D\u00F6rfer, Weinlandschaften und wilde Flussschluchten." },
  "info.about.mission.title": { en:"Our Mission",   de:"Unsere Mission" },
  "info.about.mission.body":  { en:"To show riders the Moldova that travel guides miss - the untouched roads, real culture, genuine hospitality, and scenery that rivals anywhere in Europe.",
                                 de:"Wir zeigen Fahrern das Moldau, das Reisef\u00FChrer \u00FCbersehen \u2013 unber\u00FChrte Stra\u00DFen, echte Kultur, herzliche Gastfreundschaft und Landschaften, die es mit ganz Europa aufnehmen k\u00F6nnen." },
  "info.about.included":      { en:"Every Tour Includes",  de:"Jede Tour beinhaltet" },
  "info.about.promise.title": { en:"Our Promise",   de:"Unser Versprechen" },
  "info.about.promise.body":  { en:"We don't run crowded bus tours. We ride. Every route has been personally tested to find the perfect balance between adventure, safety, and unforgettable scenery.",
                                 de:"Wir veranstalten keine \u00FCberf\u00FCllten Bustouren. Wir fahren. Jede Route wurde pers\u00F6nlich getestet, um die perfekte Balance zwischen Abenteuer, Sicherheit und unvergesslicher Landschaft zu finden." },
  "info.about.bookcta":       { en:"Book Your Ride",       de:"Jetzt buchen" },

  "info.fleet.tag":   { en:"Our Fleet",              de:"Unsere Flotte" },
  "info.fleet.h2a":   { en:"Premium Bikes.",          de:"Premium-Motorr\u00E4der." },
  "info.fleet.h2b":   { en:"Zero Compromises.",       de:"Keine Kompromisse." },
  "info.fleet.lead":  { en:"Every motorcycle is maintained to the highest standards and inspected before each rental or tour. We ride CFMOTO 800MT Adventure bikes.",
                        de:"Jedes Motorrad wird nach h\u00F6chsten Standards gewartet und vor jeder Vermietung oder Tour inspiziert. Wir fahren CFMOTO 800MT Adventure-Motorr\u00E4der." },
  "info.fleet.specs": { en:"CFMOTO 800MT Adventure",  de:"CFMOTO 800MT Adventure" },
  "info.fleet.incl":  { en:"Always Included",         de:"Immer inklusive" },

  "info.routes.tag":      { en:"Routes",               de:"Routen" },
  "info.routes.h2a":      { en:"Roads No GPS",         de:"Stra\u00DFen, die kein GPS" },
  "info.routes.h2b":      { en:"Will Ever Suggest",    de:"je vorschlagen wird" },
  "info.routes.lead":     { en:"Moldova offers empty roads, dramatic scenery, world-class wine culture, and monastery landscapes - without the crowds or the price tag.",
                            de:"Moldau bietet leere Stra\u00DFen, dramatische Landschaften, erstklassige Weinkultur und Klosterlandschaften \u2013 ohne Menschenmassen und \u00FCberh\u00F6hte Preise." },
  "info.routes.notsure":  { en:"Not sure which tour suits you?", de:"Unsicher, welche Tour zu Ihnen passt?" },
  "info.routes.notsure.sub": { en:"Message us on WhatsApp and we will help you pick the perfect route.",
                               de:"Schreiben Sie uns auf WhatsApp und wir helfen Ihnen, die perfekte Route zu finden." },
  "info.routes.wa":       { en:"Chat on WhatsApp",     de:"WhatsApp schreiben" },
  "info.routes.book":     { en:"Book Directly",        de:"Direkt buchen" },

  "info.safety.tag":  { en:"Safety",              de:"Sicherheit" },
  "info.safety.h2a":  { en:"Your Safety.",         de:"Ihre Sicherheit." },
  "info.safety.h2b":  { en:"Our Responsibility.",  de:"Unsere Verantwortung." },
  "info.safety.lead": { en:"We take safety seriously - not as a legal box to tick, but because we are riders too and we want you to come home with great stories.",
                        de:"Wir nehmen Sicherheit ernst \u2013 nicht als b\u00FCrokratische Pflicht, sondern weil wir selbst Fahrer sind und m\u00F6chten, dass Sie mit tollen Geschichten nach Hause kommen." },
  "info.safety.t1":   { en:"License Requirements",  de:"F\u00FChrerschein-Anforderungen" },
  "info.safety.t2":   { en:"Age Requirements",      de:"Altersanforderungen" },
  "info.safety.t3":   { en:"Mandatory Gear",        de:"Pflichtausr\u00FCstung" },
  "info.safety.breakdown": { en:"What Happens If Something Goes Wrong", de:"Was passiert, wenn etwas schiefgeht" },
  "info.safety.guided": { en:"Guided Tours",        de:"Gef\u00FChrte Touren" },
  "info.safety.guided.body": { en:"A support vehicle follows every multi-day tour. Our guides carry first-aid kits and have emergency protocols for every route segment.",
                               de:"Ein Begleitfahrzeug folgt jeder mehrt\u00E4gigen Tour. Unsere F\u00FChrer tragen Erste-Hilfe-Ausr\u00FCstung und haben Notfallprotokolle f\u00FCr jeden Streckenabschnitt." },
  "info.safety.rental": { en:"Rentals",             de:"Vermietungen" },
  "info.safety.rental.body": { en:"24/7 roadside assistance. 2-hour response guarantee anywhere in Moldova. A replacement motorcycle can be dispatched for longer breakdowns.",
                               de:"24/7 Pannenhilfe. Garantierte 2-Stunden-Reaktionszeit in ganz Moldau. Ein Ersatzmotorrad kann f\u00FCr l\u00E4ngere Pannen bereitgestellt werden." },
  "info.safety.insurance": { en:"Insurance Coverage",  de:"Versicherungsschutz" },
  "info.safety.insurance.body": { en:"All motorcycles include mandatory third-party liability insurance. Additional comprehensive coverage is available. We strongly recommend personal travel insurance covering motorcycle touring.",
                                  de:"Alle Motorr\u00E4der sind mit der gesetzlich vorgeschriebenen Haftpflichtversicherung ausgestattet. Zus\u00E4tzlicher Vollkaskoversicherungsschutz ist verf\u00FCgbar. Wir empfehlen dringend eine pers\u00F6nliche Reiseversicherung, die Motorradtouren abdeckt." },

  "info.faq.tag":       { en:"FAQ",                         de:"H\u00E4ufige Fragen" },
  "info.faq.h2a":       { en:"Questions.",                  de:"Fragen." },
  "info.faq.h2b":       { en:"Answered.",                   de:"Beantwortet." },
  "info.faq.lead":      { en:"Everything you need to know before booking. Still have questions? Message us directly.",
                          de:"Alles, was Sie vor der Buchung wissen m\u00FCssen. Noch Fragen? Schreiben Sie uns direkt." },
  "info.faq.still":     { en:"Still have a question?",      de:"Noch eine Frage?" },
  "info.faq.still.sub": { en:"We reply on WhatsApp within 1 hour during business hours.",
                          de:"Wir antworten auf WhatsApp innerhalb einer Stunde w\u00E4hrend der Gesch\u00E4ftszeiten." },
  "info.faq.wa":        { en:"Message Us",                  de:"Nachricht senden" },

  "info.terms.tag":  { en:"Legal",        de:"Rechtliches" },
  "info.terms.h2a":  { en:"Terms and",    de:"Allgemeine" },
  "info.terms.h2b":  { en:"Conditions",   de:"Gesch\u00E4ftsbedingungen" },
  "info.terms.lead": { en:"By booking with us you agree to the following terms.",
                       de:"Mit Ihrer Buchung stimmen Sie den folgenden Bedingungen zu." },

  "info.final.h":    { en:"Ready to Ride Moldova?",   de:"Bereit, Moldau zu erkunden?" },
  "info.final.p":    { en:"Limited spots available. Book early to secure your place on the road less travelled.",
                       de:"Begrenzte Pl\u00E4tze verf\u00FCgbar. Buchen Sie fr\u00FChzeitig und sichern Sie sich Ihren Platz auf der Stra\u00DFe, die kaum jemand kennt." },
  "info.final.book": { en:"Book Your Tour",   de:"Tour buchen" },
  "info.final.wa":   { en:"WhatsApp Us",      de:"WhatsApp" },

  // FAQ questions + answers (DE reviewed for grammar)
  "faq.q1":  { en:"Do I need a motorcycle license?",
               de:"Ben\u00F6tige ich einen Motorradführerschein?" },
  "faq.a1":  { en:"Yes. A valid motorcycle license (Category A or A2) is required for all tours and rentals. We verify this at check-in.",
               de:"Ja. F\u00FCr alle Touren und Vermietungen ist ein g\u00FCltiger Motorradführerschein (Kategorie A oder A2) erforderlich. Wir \u00FCberpr\u00FCfen diesen beim Check-in." },
  "faq.q2":  { en:"Do you offer guided tours?",
               de:"Bieten Sie gef\u00FChrte Touren an?" },
  "faq.a2":  { en:"Yes. We offer fully guided small-group tours with a local expert rider, as well as self-guided rentals for experienced riders who prefer to explore independently.",
               de:"Ja. Wir bieten vollst\u00E4ndig gef\u00FChrte Kleingruppen-Touren mit einem lokalen Expertenfahrer an, sowie selbst organisierte Vermietungen f\u00FCr erfahrene Fahrer, die lieber eigenst\u00E4ndig erkunden." },
  "faq.q3":  { en:"What is included in the rental?",
               de:"Was ist in der Miete inbegriffen?" },
  "faq.a3":  { en:"Every rental includes the motorcycle, helmet, gloves, phone/navigation mount, luggage system (top case or side panniers), and 24/7 roadside assistance.",
               de:"Jede Vermietung beinhaltet das Motorrad, Helm, Handschuhe, Halterung f\u00FCr Telefon/Navigation, Gep\u00E4cksystem (Topcase oder Seitentaschen) sowie 24/7 Pannenhilfe." },
  "faq.q4":  { en:"Do I need travel insurance?",
               de:"Ben\u00F6tige ich eine Reiseversicherung?" },
  "faq.a4":  { en:"We strongly recommend comprehensive travel insurance covering motorcycle riding. The motorcycle has basic third-party insurance included, but personal travel cover is your responsibility.",
               de:"Wir empfehlen dringend eine umfassende Reiseversicherung, die das Motorradfahren abdeckt. Das Motorrad verf\u00FCgt \u00FCber eine grundlegende Haftpflichtversicherung, aber der pers\u00F6nliche Reiseschutz liegt in Ihrer Verantwortung." },
  "faq.q5":  { en:"What happens in case of breakdown?",
               de:"Was passiert bei einer Panne?" },
  "faq.a5":  { en:"We provide roadside assistance and a support vehicle on all guided tours. For rentals, we respond within 2 hours anywhere in Moldova.",
               de:"Wir bieten Pannenhilfe und ein Begleitfahrzeug bei allen gef\u00FChrten Touren. Bei Vermietungen reagieren wir innerhalb von 2 Stunden in ganz Moldau." },
  "faq.q6":  { en:"Can beginners join the tours?",
               de:"K\u00F6nnen Anf\u00E4nger an den Touren teilnehmen?" },
  "faq.a6":  { en:"Tours are designed for riders with at least 2 years of experience on bikes over 400cc. If you are a complete beginner, contact us and we will help you find the right option.",
               de:"Touren sind f\u00FCr Fahrer mit mindestens 2 Jahren Erfahrung auf Motorr\u00E4dern \u00FCber 400 cm\u00B3 ausgelegt. Wenn Sie ein kompletter Anf\u00E4nger sind, kontaktieren Sie uns und wir helfen Ihnen, die richtige Option zu finden." },
  "faq.q7":  { en:"How many riders are in a group?",
               de:"Wie viele Fahrer sind in einer Gruppe?" },
  "faq.a7":  { en:"Groups are capped at 6-8 riders to keep the experience personal. No crowded convoys - just a small group of passionate riders.",
               de:"Gruppen sind auf 6-8 Fahrer begrenzt, um ein pers\u00F6nliches Erlebnis zu gew\u00E4hrleisten. Keine \u00FCberf\u00FCllten Konvois \u2013 nur eine kleine Gruppe leidenschaftlicher Fahrer." },
  "faq.q8":  { en:"When is the best time to visit Moldova?",
               de:"Wann ist die beste Zeit, Moldau zu besuchen?" },
  "faq.a8":  { en:"April through October is the ideal riding season. Late May through September offers the best weather. September harvest season is our personal favourite.",
               de:"April bis Oktober ist die ideale Fahrsaison. Von Ende Mai bis September ist das Wetter am besten. Die Erntezeit im September ist unser pers\u00F6nlicher Favorit." },

  // Terms sections
  "terms.booking.title":  { en:"Booking and Reservations",
                            de:"Buchung und Reservierungen" },
  "terms.booking.body":   { en:"Reservations must be made in advance through our website or by direct contact. A deposit may be required. Full payment must be completed before the start of the rental or tour. We accept credit card, bank transfer, and online payment.",
                            de:"Reservierungen m\u00FCssen im Voraus \u00FCber unsere Website oder durch direkten Kontakt erfolgen. Eine Anzahlung kann erforderlich sein. Die vollst\u00E4ndige Zahlung muss vor Beginn der Vermietung oder Tour abgeschlossen sein. Wir akzeptieren Kreditkarte, Banküberweisung und Online-Zahlung." },
  "terms.cancel.title":   { en:"Cancellations and Refunds",
                            de:"Stornierungen und R\u00FCckerstattungen" },
  "terms.cancel.body":    { en:"More than 14 days before the tour: full refund of deposit. 7-14 days: 50% refund. Under 7 days: no refund. In case of force majeure we will offer a full rebooking at no extra cost.",
                            de:"Mehr als 14 Tage vor der Tour: volle R\u00FCckerstattung der Anzahlung. 7-14 Tage: 50% R\u00FCckerstattung. Unter 7 Tagen: keine R\u00FCckerstattung. Bei h\u00F6herer Gewalt bieten wir eine kostenlose Umbuchung an." },
  "terms.rider.title":    { en:"Rider Responsibility",
                            de:"Verantwortung des Fahrers" },
  "terms.rider.body":     { en:"You are responsible for respecting local traffic laws, riding safely and sober, and returning the motorcycle in the same condition. Any damage caused by negligence or reckless riding will be charged to the renter at full repair cost.",
                            de:"Sie sind verantwortlich f\u00FCr die Einhaltung der lokalen Verkehrsregeln, sicheres und n\u00FCchternes Fahren sowie die R\u00FCckgabe des Motorrads im gleichen Zustand. Durch Fahrl\u00E4ssigkeit oder riskantes Fahren verursachte Sch\u00E4den werden dem Mieter in voller H\u00F6he der Reparaturkosten berechnet." },
  "terms.liability.title":{ en:"Liability",
                            de:"Haftung" },
  "terms.liability.body": { en:"Participants acknowledge that motorcycle riding carries inherent risks and agree to participate at their own responsibility. Moldova Moto Tours cannot be held liable for accidents resulting from rider negligence or violation of traffic laws.",
                            de:"Teilnehmer erkennen an, dass das Motorradfahren inhärente Risiken birgt, und stimmen der Teilnahme auf eigene Verantwortung zu. Moldova Moto Tours haftet nicht f\u00FCr Unf\u00E4lle, die auf Fahrl\u00E4ssigkeit des Fahrers oder Verletzung von Verkehrsregeln zur\u00FCckzuf\u00FChren sind." },
  "terms.insurance.title":{ en:"Insurance",
                            de:"Versicherung" },
  "terms.insurance.body": { en:"All rentals include mandatory third-party insurance as required by Moldovan law. Comprehensive coverage is the rider's responsibility unless an upgrade is purchased. We strongly recommend personal travel insurance covering motorcycle activities.",
                            de:"Alle Vermietungen beinhalten die nach moldauischem Recht vorgeschriebene Haftpflichtversicherung. Eine Vollkaskoversicherung liegt in der Verantwortung des Fahrers, sofern kein Upgrade erworben wird. Wir empfehlen dringend eine pers\u00F6nliche Reiseversicherung, die Motorradaktivit\u00E4ten abdeckt." },
};

export default T;
