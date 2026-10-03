import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import services from "@/data/services.json";
import type { Service } from "@/data/types";
import { PageShell } from "@/components/PageShell";
import { T } from "@/components/T";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ServiceActions } from "@/components/ServiceActions";

const all = services as Service[];
export const dynamicParams = false;
export function generateStaticParams() { return all.map((s) => ({ slug: s.slug })); }

const seo: Record<string, string> = {
  "dairy-fans": "Dairy Fans in Pakistan",
  "fan-installation": "Dairy Farm Fan Installation",
  "milking-parlour": "Milking Parlour System",
  "showering-systems": "Cattle Shower System",
  "milking-spare-parts": "Milking Machine Spare Parts",
  "vacuum-pumps": "Vacuum Pump for Milking Machine",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = all.find((x) => x.slug === slug);
  if (!s) return {};
  return { title: seo[s.slug] ?? s.title, description: s.description, alternates: { canonical: `/services/${s.slug}/` } };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = all.find((x) => x.slug === slug);
  if (!s) notFound();
  return (
    <PageShell kicker={<T k="services.kicker" />} title={<T en={s.title} ur={s.titleUr} />} intro={<T en={s.short} ur={s.shortUr} />}>
      <div className="grid gap-10 md:grid-cols-[auto_1fr]">
        <span className="grid h-28 w-28 place-items-center rounded-3xl bg-navy text-steel"><ServiceIcon name={s.icon} className="h-20 w-20" /></span>
        <div>
          <p className="max-w-2xl text-lg leading-relaxed">{s.description}</p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">{s.points.map((p) => <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-steel-dark" />{p}</li>)}</ul>
          <ServiceActions title={s.title} category={s.category} />
          <p className="mt-10 text-sm"><Link href="/#services" className="text-steel-dark underline underline-offset-4">← All services</Link></p>
        </div>
      </div>
    </PageShell>
  );
}
