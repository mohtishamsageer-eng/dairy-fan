import type { Metadata } from "next";
import { notFound } from "next/navigation";
import products from "@/data/products.json";
import type { Product } from "@/data/types";
import { PageShell } from "@/components/PageShell";
import { T } from "@/components/T";
import { ProductDetail } from "@/components/ProductDetail";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

const all = products as unknown as Product[];
export const dynamicParams = false;
export function generateStaticParams() { return all.map((p) => ({ id: p.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = all.find((x) => x.id === id);
  if (!p) return {};
  return { title: p.name, description: p.shortDesc, alternates: { canonical: `/products/${p.id}/` } };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = all.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <PageShell kicker={<T k="products.kicker" />} title={<T en={p.name} ur={p.nameUr} />}>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.shortDesc,
        image: p.images.map((i) => `${site.url}${i}`), brand: { "@type": "Brand", name: site.brand },
        category: p.category,
      }} />
      <ProductDetail p={p} />
    </PageShell>
  );
}
