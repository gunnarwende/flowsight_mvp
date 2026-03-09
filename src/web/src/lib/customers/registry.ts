import type { CustomerSite } from "./types";
import { doerflerAg } from "./doerfler-ag";
import { brunnerHaustechnik } from "./brunner-haustechnik";
import { walterLeuthold } from "./walter-leuthold";
import { orlandini } from "./orlandini";
import { widmerSanitaer } from "./widmer-sanitaer";
import { weinbergerAg } from "./weinberger-ag";

/**
 * Customer registry — add new customers here.
 * The dynamic route /kunden/[slug] looks up customers by slug.
 */
const customers: Record<string, CustomerSite> = {
  "doerfler-ag": doerflerAg,
  "brunner-haustechnik": brunnerHaustechnik,
  "walter-leuthold": walterLeuthold,
  "orlandini": orlandini,
  "widmer-sanitaer": widmerSanitaer,
  "weinberger-ag": weinbergerAg,
};

export function getCustomer(slug: string): CustomerSite | undefined {
  return customers[slug];
}

export function getAllCustomerSlugs(): string[] {
  return Object.keys(customers);
}
