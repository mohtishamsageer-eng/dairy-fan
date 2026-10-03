// Single place for company details. Replace every [PLACEHOLDER] before launch.
export const site = {
  name: "Khaleeq Engineering",
  brand: "Khaleeq Fans",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://khaleeq-fans.example",
  // digits only, country code first, e.g. "923001234567"
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "92XXXXXXXXXX",
  phoneDisplay: "[PLACEHOLDER: +92 3XX XXXXXXX]",
  email: "[PLACEHOLDER: email]",
  address: "[PLACEHOLDER: street address]",
  city: "[PLACEHOLDER: City], Pakistan",
  timings: "[PLACEHOLDER: opening hours]",
  facebook: "https://www.facebook.com/",
  // Google Maps embed URL (Share → Embed a map → copy the src). Empty hides the map.
  mapEmbed: "",
  // Real numbers only. Leave the array empty to hide the counters.
  stats: [] as { value: number; suffix?: string; label: string; labelUr?: string }[],
};

export const waLink = (text: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const telLink = () => `tel:+${site.whatsapp}`;
