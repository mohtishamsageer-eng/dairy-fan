import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { T } from "@/components/T";
import { ContactForm, ContactInfo } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact: Get a Quote or Site Survey",
  description: "Contact Khaleeq Engineering on WhatsApp or phone for a quote or site survey for dairy fans and dairy-farm systems.",
  alternates: { canonical: "/contact/" },
};
export default function Page() {
  return (
    <PageShell kicker={<T k="contact.kicker" />} title={<T k="contact.title" />}>
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]"><ContactForm /><ContactInfo /></div>
    </PageShell>
  );
}
