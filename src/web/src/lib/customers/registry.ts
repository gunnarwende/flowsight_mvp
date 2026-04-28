import type { CustomerSite } from "./types";
import { doerflerAg } from "./doerfler-ag";
import { brunnerHaustechnik } from "./brunner-haustechnik";
import { walterLeuthold } from "./walter-leuthold";
import { orlandini } from "./orlandini";
import { widmerSanitaer } from "./widmer-sanitaer";
import { weinbergerAg } from "./weinberger-ag";
import { leinsAg } from "./leins-ag";
import { waeltiSohnAg } from "./waelti-sohn-ag";
import { starkHaustechnik } from "./stark-haustechnik";
import { buildCustomerFromConfig, listConfigSlugs } from "./fallback";

/**
 * Customer registry — explizit hinterlegte (High-End gepflegte) CustomerSites.
 * Tenants OHNE Eintrag hier werden automatisch aus docs/customers/<slug>/tenant_config.json
 * via buildCustomerFromConfig() gebaut (minimale CustomerSite für Wizard).
 *
 * Dieser Fallback ist der Skalierungs-Game-Changer: beliebig viele Tenants
 * ohne pro-Tenant TS-Boilerplate.
 */
const customers: Record<string, CustomerSite> = {
  "doerfler-ag": doerflerAg,
  "brunner-haustechnik": brunnerHaustechnik,
  "walter-leuthold": walterLeuthold,
  "orlandini": orlandini,
  "widmer-sanitaer": widmerSanitaer,
  "weinberger-ag": weinbergerAg,
  "leins-ag": leinsAg,
  "waelti-sohn-ag": waeltiSohnAg,
  "stark-haustechnik": starkHaustechnik,
};

export function getCustomer(slug: string): CustomerSite | undefined {
  if (customers[slug]) return customers[slug];
  // Fallback: versuche aus tenant_config zu laden
  const fromConfig = buildCustomerFromConfig(slug);
  if (fromConfig) return fromConfig;
  return undefined;
}

export function getAllCustomerSlugs(): string[] {
  // Union: explizit registriert + alle tenant_configs gefunden
  const explicit = new Set(Object.keys(customers));
  const fromConfigs = listConfigSlugs();
  for (const s of fromConfigs) explicit.add(s);
  return Array.from(explicit);
}
