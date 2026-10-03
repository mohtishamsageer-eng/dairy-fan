import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { T } from "@/components/T";
import { Installations } from "@/components/Installations";

export const metadata: Metadata = {
  title: "Dairy Farm Fan Installation: Our Work",
  description: "Photos of Khaleeq dairy fan, shower and control-system installations on dairy farms and cattle sheds in Pakistan.",
  alternates: { canonical: "/installations/" },
};
export default function Page() {
  return <PageShell dark kicker={<T k="work.kicker" />} title={<T k="work.title" />}><Installations /></PageShell>;
}
