import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Cursor } from "@/components/Cursor";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Dairy Fans in Pakistan | Khaleeq Fans, Khaleeq Engineering", template: "%s | Khaleeq Fans" },
  description: "Khaleeq Engineering manufactures, supplies and installs dairy fans, wiring, panel boards, showering systems, milking parlour systems, milking machine spare parts and vacuum pumps for dairy farms in Pakistan.",
  openGraph: { type: "website", siteName: "Khaleeq Fans", images: ["/assets/fan/og.jpg"] },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};
export const viewport: Viewport = { themeColor: "#0B1620", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  alternateName: site.brand,
  url: site.url,
  image: `${site.url}/assets/fan/og.jpg`,
  logo: `${site.url}/assets/logo/logo-mark-dark.png`,
  areaServed: { "@type": "Country", name: "Pakistan" },
  description: "Manufacturer and installer of dairy fans and dairy-farm systems in Pakistan.",
  sameAs: [site.facebook],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Nastaliq+Urdu:wght@400;600&family=Space+Grotesk:wght@500;600;700&display=swap" />
        <link rel="preload" as="image" href="/assets/fan/poster.webp" media="(min-width: 768px)" />
        <link rel="preload" as="image" href="/assets/fan/poster-mobile.webp" media="(max-width: 767px)" />
        <JsonLd data={jsonLd} />
      </head>
      <body>
        <LangProvider>
          <SmoothScroll />
          <Cursor />
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-navy">Skip to content</a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppFab />
        </LangProvider>
      </body>
    </html>
  );
}
