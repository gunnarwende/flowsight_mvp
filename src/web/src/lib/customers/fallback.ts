import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { CustomerSite, CustomerCategory } from "./types";

/**
 * Fallback-Loader: Liest aus docs/customers/<slug>/tenant_config.json und baut
 * eine minimale CustomerSite. Wird in registry.ts als Fallback genutzt wenn
 * Tenant nicht explizit als TS-File hinterlegt ist. Damit skaliert die Pipeline
 * auf beliebig viele Betriebe ohne pro-Tenant TS-Boilerplate.
 */

// Repo-Root — diese Datei liegt unter src/web/src/lib/customers → 4× hoch
const REPO_ROOT = resolve(__dirname, "..", "..", "..", "..", "..");
const CUSTOMERS_DIR = join(REPO_ROOT, "docs", "customers");

function configPath(slug: string): string {
  return join(CUSTOMERS_DIR, slug, "tenant_config.json");
}

function loadConfig(slug: string): Record<string, unknown> | null {
  try {
    const p = configPath(slug);
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

/** Gibt alle slugs zurück die in docs/customers/-slug-/tenant_config.json existieren. */
export function listConfigSlugs(): string[] {
  try {
    if (!existsSync(CUSTOMERS_DIR)) return [];
    const dirs = readdirSync(CUSTOMERS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
      .map((d) => d.name);
    return dirs.filter((slug) => existsSync(configPath(slug)));
  } catch {
    return [];
  }
}

/** Versuche eine CustomerSite-Instanz aus tenant_config zu bauen. Liefert null
 *  wenn Config fehlt oder Pflichtfelder unvollständig sind. */
export function buildCustomerFromConfig(slug: string): CustomerSite | null {
  const cfg = loadConfig(slug);
  if (!cfg) return null;
  const tenant = (cfg.tenant as Record<string, unknown>) || {};
  const video = (cfg.video as Record<string, unknown>) || {};
  const wizardCfg = (cfg.wizard as Record<string, unknown>) || {};
  const voiceAgent = (cfg.voice_agent as Record<string, unknown>) || {};

  const companyName = (tenant.name as string) || slug;
  const brandColor = ((tenant.brand_color as string) || "#2b6cb0").startsWith("#")
    ? (tenant.brand_color as string)
    : `#${tenant.brand_color}`;

  const phone = (video.display_phone_local as string) || (video.display_phone as string) || "044 000 00 00";
  const phoneRaw = (video.display_phone as string) || "+41000000000";

  const address = (voiceAgent.address as Record<string, string>) || {};
  const street = address.street || "Musterstrasse 1";
  const zip = address.zip || "8000";
  const city = address.city || "Zürich";

  const categoriesRaw = wizardCfg.categories as Array<Record<string, unknown>> | undefined;
  const categories: CustomerCategory[] = Array.isArray(categoriesRaw)
    ? categoriesRaw.map((c) => ({
        value: (c.value as string) || "sonstiges",
        label: (c.label as string) || "Sonstiges",
        hint: (c.hint as string) || "",
        iconKey: (c.iconKey as string) || "wrench",
        fixed: c.fixed as boolean | undefined,
      }))
    : [
        { value: "sonstiges", label: "Sonstiges", hint: "Allgemeines Anliegen", iconKey: "wrench" },
      ];

  const emergencyPhone = ((cfg.emergency_policy as Record<string, unknown>)?.phone as string) || phone;
  const emergencyPhoneRaw = phoneRaw;

  return {
    slug,
    companyName,
    tagline: `${companyName} — Ihr zuverlässiger Servicepartner`,
    metaDescription: `${companyName} in ${city}. Schnell, sauber, zuverlässig.`,
    brandColor,
    seoKeywords: [companyName, `${city}`, "Sanitär", "Heizung", "Notdienst"],
    contact: {
      phone,
      phoneRaw,
      email: `info@${slug}.ch`,
      address: { street, zip, city, canton: "ZH" },
      website: `${slug}.ch`,
      mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(`${street}, ${zip} ${city}`)}&output=embed`,
    },
    emergency: {
      enabled: true,
      phone: emergencyPhone,
      phoneRaw: emergencyPhoneRaw,
      label: "24h Notfall",
      description: `Notfälle in ${city} und Umgebung — wir sind rund um die Uhr erreichbar.`,
    },
    services: [],
    reviews: { averageRating: 0, totalReviews: 0, googleUrl: "", highlights: [] },
    team: [],
    gallery: [],
    categories,
    serviceArea: { region: city, gemeinden: [city] },
  } as unknown as CustomerSite;
}
