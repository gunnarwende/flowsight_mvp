import type { Metadata } from "next";
import { BigBenContent } from "./BigBenContent";

export const metadata: Metadata = {
  title: "Big Ben Pub — Your Local in Oberrieden",
  description:
    "Traditional British pub in Oberrieden. Best Guinness on the lake, live sports, events, and proper pub food. Book your table online.",
  openGraph: {
    title: "Big Ben Pub — Your Local in Oberrieden",
    description:
      "Best Guinness on the lake, live sports, events & proper pub food. Book your table online.",
    url: "https://flowsight.ch/bigben-pub",
    siteName: "Big Ben Pub",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Big Ben Pub — Your Local in Oberrieden",
    description:
      "Best Guinness on the lake, live sports, events & proper pub food. Book your table online.",
  },
};

export default function BigBenPubPage() {
  return <BigBenContent />;
}
