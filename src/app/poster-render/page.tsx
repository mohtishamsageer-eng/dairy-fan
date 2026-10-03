import type { Metadata } from "next";
import { PosterRender } from "@/components/PosterRender";

// Used only by `npm run poster` to capture assets/fan/poster.webp and og.jpg. Not indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function Page() { return <PosterRender />; }
