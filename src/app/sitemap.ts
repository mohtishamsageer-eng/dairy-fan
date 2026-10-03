import type { MetadataRoute } from "next";
import products from "@/data/products.json";
import services from "@/data/services.json";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => ({ url: `${site.url}${p}`, lastModified: new Date() });
  return [u("/"), u("/products/"), u("/installations/"), u("/contact/"),
    ...products.map((p) => u(`/products/${p.id}/`)), ...services.map((s) => u(`/services/${s.slug}/`))];
}
