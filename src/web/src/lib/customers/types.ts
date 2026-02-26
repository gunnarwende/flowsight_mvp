/**
 * Customer Website Data Schema
 *
 * Defines the complete data structure for a customer's website.
 * Every customer website is generated from this shape.
 */

// ── Core ──────────────────────────────────────────────────────────

export interface CustomerSite {
  /** URL slug, e.g. "doerfler-ag" */
  slug: string;
  /** Company name as displayed */
  companyName: string;
  /** Short tagline for hero, e.g. "Ihr Sanitär- und Heizungsspezialist seit 1986" */
  tagline: string;
  /** 1-2 sentence description for SEO meta */
  metaDescription: string;
  /** Primary brand color hex (used for accents) — default: gold-500 */
  brandColor?: string;

  contact: ContactInfo;
  emergency?: EmergencyInfo;
  services: Service[];
  gallery: GalleryCategory[];
  beforeAfter?: BeforeAfterProject[];
  reviews?: ReviewsConfig;
  serviceArea: ServiceAreaConfig;
  team: TeamMember[];
  certifications?: Certification[];
  brandPartners?: BrandPartner[];
  history?: HistoryEntry[];
  careers?: JobListing[];

  /** Additional SEO keywords */
  seoKeywords?: string[];
}

// ── Contact ───────────────────────────────────────────────────────

export interface ContactInfo {
  phone: string;
  phoneRaw: string; // tel: link format
  email?: string;
  address: {
    street: string;
    zip: string;
    city: string;
    canton?: string;
  };
  website?: string; // legacy URL
  /** Google Maps embed URL or coordinates */
  mapEmbedUrl?: string;
  openingHours?: string[];
}

// ── Emergency / Notdienst ─────────────────────────────────────────

export interface EmergencyInfo {
  /** true = show Notdienst banner prominently */
  enabled: boolean;
  phone: string;
  phoneRaw: string;
  /** e.g. "24h Notdienst — 365 Tage" */
  label: string;
  /** e.g. "Rohrbruch? Heizung ausgefallen? Wir sind innert 60 Minuten vor Ort." */
  description?: string;
}

// ── Services ──────────────────────────────────────────────────────

export interface Service {
  /** Display name, e.g. "Badsanierung" */
  name: string;
  /** URL-safe slug for anchor/page, e.g. "badsanierung" */
  slug: string;
  /** Short description (1-2 sentences) */
  summary: string;
  /** Longer description for dedicated section */
  description?: string;
  /** Icon identifier (we map these to SVG icons) */
  icon?: ServiceIcon;
  /** Reference images for this service */
  images?: string[];
}

export type ServiceIcon =
  | "bath"
  | "heating"
  | "pipe"
  | "solar"
  | "wrench"
  | "water"
  | "flame"
  | "snowflake"
  | "roof"
  | "pump"
  | "tool"
  | "leaf";

// ── Gallery ───────────────────────────────────────────────────────

export interface GalleryCategory {
  /** e.g. "Sanitär", "Heizung", "Spenglerei" */
  name: string;
  slug: string;
  /** Image paths relative to /kunden/[slug]/ */
  images: GalleryImage[];
}

export interface GalleryImage {
  src: string;
  alt?: string;
  /** Optional: width/height for layout optimization */
  width?: number;
  height?: number;
}

// ── Before / After ────────────────────────────────────────────────

export interface BeforeAfterProject {
  title: string;
  description?: string;
  location?: string;
  beforeImage: string;
  afterImage: string;
}

// ── Google Reviews ────────────────────────────────────────────────

export interface ReviewsConfig {
  /** Average star rating, e.g. 4.8 */
  averageRating: number;
  /** Total number of reviews */
  totalReviews: number;
  /** Google Maps / Business URL */
  googleUrl?: string;
  /** Selected quotes to display */
  highlights: ReviewHighlight[];
}

export interface ReviewHighlight {
  author: string;
  rating: number;
  text: string;
  /** e.g. "vor 2 Monaten" */
  date?: string;
}

// ── Service Area ──────────────────────────────────────────────────

export interface ServiceAreaConfig {
  /** Main region, e.g. "Zürich Süd" */
  region: string;
  /** List of Gemeinden served */
  gemeinden: string[];
  /** Optional radius description, e.g. "Im Umkreis von 15 km" */
  radiusDescription?: string;
}

// ── Team ──────────────────────────────────────────────────────────

export interface TeamMember {
  name: string;
  role: string;
  /** Image path */
  image?: string;
  /** Short bio */
  bio?: string;
}

// ── Certifications ────────────────────────────────────────────────

export interface Certification {
  name: string;
  /** e.g. "suissetec", "Minergie" */
  issuer?: string;
  /** Logo/badge image path */
  logo?: string;
}

// ── Brand Partners ────────────────────────────────────────────────

export interface BrandPartner {
  name: string;
  logo?: string;
  url?: string;
}

// ── Company History ───────────────────────────────────────────────

export interface HistoryEntry {
  year: number;
  title: string;
  description?: string;
  image?: string;
}

// ── Careers ───────────────────────────────────────────────────────

export interface JobListing {
  title: string;
  type: "fulltime" | "parttime" | "apprentice";
  description: string;
  requirements?: string[];
}
