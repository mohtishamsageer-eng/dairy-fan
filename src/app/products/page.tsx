import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { T } from "@/components/T";
import { ProductsCatalog } from "@/components/ProductsCatalog";

export const metadata: Metadata = {
  title: "Dairy Fans, Panels, Spare Parts & Vacuum Pumps",
  description: "Browse Khaleeq dairy fans, panel boards, showering systems, milking machine spare parts and vacuum pumps for dairy farms in Pakistan.",
  alternates: { canonical: "/products/" },
};
export default function ProductsPage() {
  return <PageShell kicker={<T k="products.kicker" />} title={<T k="products.title" />}><ProductsCatalog /></PageShell>;
}
