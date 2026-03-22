import { redirect } from "next/navigation";

/** 301 redirect: /testen → /live-erleben (SEO + existing links in emails/outreach) */
export default function TestenRedirect() {
  redirect("/live-erleben");
}
