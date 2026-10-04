export const SHOP = {
  name: "Screws & Tools",
  street: "9 Faith Avenue",
  city: "Nassau",
  country: "The Bahamas",
  address: "9 Faith Avenue, Nassau, The Bahamas",
  phone: "+1 242-341-7337",
  phoneHref: "tel:+12423417337",
  // TODO: replace with the real WhatsApp number (digits only, e.g. 12425550000)
  whatsapp: "",
  // TODO: replace with the real Google review link
  googleReviewUrl: "",
  mapEmbed: "https://www.google.com/maps?q=9+Faith+Avenue,+Nassau,+Bahamas&output=embed",
  mapLink: "https://www.google.com/maps/search/?api=1&query=9+Faith+Avenue+Nassau+Bahamas",
};

export const whatsappHref = () =>
  `https://wa.me/${SHOP.whatsapp || "12423417337"}?text=${encodeURIComponent("Hi Screws & Tools, do you have ")}`;
export const reviewHref = () => SHOP.googleReviewUrl || SHOP.mapLink;

// Opening hours, minutes from midnight. Index 0 = Sunday.
export const HOURS: (null | { open: number; close: number })[] = [
  null,
  { open: 450, close: 1020 },
  { open: 450, close: 1020 },
  { open: 450, close: 1020 },
  { open: 450, close: 1020 },
  { open: 450, close: 1020 },
  { open: 450, close: 900 },
];
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fmtTime = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${mm.toString().padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
export const hoursLabel = (day: number) => {
  const h = HOURS[day];
  return h ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : "Closed";
};

export function nassauNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Nassau",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function isOpenAt(date = new Date()) {
  const { day, minutes } = nassauNow(date);
  const h = HOURS[day];
  return !!h && minutes >= h.open && minutes < h.close;
}


export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/["'″]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

export const categoryName = (slug: string) =>
  slug.split("-").map((w) => (w === "and" ? "&" : w[0]?.toUpperCase() + w.slice(1))).join(" ");

export const formatPrice = (p: number | null) =>
  p == null ? "Ask for price" : `B$${Number(p).toFixed(2)}`;

export const localBusinessJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: SHOP.name,
  telephone: SHOP.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: SHOP.street,
    addressLocality: SHOP.city,
    addressCountry: "BS",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:30", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "07:30", closes: "15:00" },
  ],
  currenciesAccepted: "BSD",
});

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  category_name: string;
  size: string;
  price: number | null;
  in_stock: boolean;
};

export const pageMeta = (title: string, description: string, url: string) => ({
  meta: [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary" },
  ],
  links: [{ rel: "canonical", href: url }],
});

export type Category = { slug: string; name: string; product_count: number };

/** Unique URL slugs: first "deck-screw", then "deck-screw-2", "deck-screw-3"… */
export function assignSlugs<T extends { name: string }>(rows: T[], taken = new Set<string>()) {
  return rows.map((r) => {
    const base = slugify(r.name);
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    taken.add(slug);
    return { ...r, slug };
  });
}
