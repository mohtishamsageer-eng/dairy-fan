import { ScrollStory } from "@/components/ScrollStory";
import { Services } from "@/components/Services";
import { FanSection } from "@/components/FanSection";
import { InstallationsPreview, ProductsPreview, QuoteSection } from "@/components/HomeSections";
import { Benefits, Process, Testimonials, Why } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <ScrollStory />
      <Services />
      <FanSection />
      <ProductsPreview />
      <InstallationsPreview />
      <Process />
      <Why />
      <Testimonials />
      <Benefits />
      <QuoteSection />
    </>
  );
}
