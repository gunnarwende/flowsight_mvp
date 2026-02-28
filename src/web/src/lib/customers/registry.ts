import type { CustomerSite } from "./types";
import { doerflerAg } from "./doerfler-ag";
import { brunnerHaustechnik } from "./brunner-haustechnik";

/**
 * Customer registry — add new customers here.
 * The dynamic route /kunden/[slug] looks up customers by slug.
 */
const customers: Record<string, CustomerSite> = {
  "doerfler-ag": doerflerAg,
  "brunner-haustechnik": brunnerHaustechnik,
};

export function getCustomer(slug: string): CustomerSite | undefined {
  return customers[slug];
}

export function getAllCustomerSlugs(): string[] {
  return Object.keys(customers);
}
