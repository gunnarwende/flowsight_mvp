import { redirect } from "next/navigation";

// Pricing 03.06.2026 von der Website genommen (Founder-Entscheid): Preise werden
// über eine separate Strategie kommuniziert, nicht kalt auf der Website gezeigt.
// Die Route bleibt als Redirect bestehen → kein 404 für gecachte/eingehende Links.
// Der frühere Pricing-Seiteninhalt (Standard/Professional CHF 299/499 etc.) ist in
// der Git-Historie erhalten und kann für die spätere Preis-Strategie restauriert werden.
export default function PricingRedirect() {
  redirect("/");
}
