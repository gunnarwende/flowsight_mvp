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
  /** Voice agent phone number (if customer has voice module) */
  voicePhone?: string;
  voicePhoneRaw?: string;
  emergency?: EmergencyInfo;
  services: Service[];
  gallery: GalleryCategory[];
  beforeAfter?: BeforeAfterProject[];
  reviews?: ReviewsConfig;
  serviceArea: ServiceAreaConfig;
  team: TeamMember[];
  /** Full team group photo */
  teamPhoto?: string;
  certifications?: Certification[];
  brandPartners?: BrandPartner[];
  history?: HistoryEntry[];
  careers?: JobListing[];

  /** Wizard categories (top row = problem, fixed = bottom row).
   *  Values MUST match voice agent post_call_analysis category values. */
  categories: CustomerCategory[];

  /** Additional SEO keywords */
  seoKeywords?: string[];

  /** Modus: 1 = Full (we build the website), 2 = Extend (prospect has own website).
   *  Controls start page layout (website card shown only for modus 1).
   *  Default: 1 */
  modus?: 1 | 2;

  /** Visual identity configuration — controls layout, hero style, colors, font.
   *  If not set, defaults to classic/neutral/geist (backwards-compatible). */
  theme?: ThemeConfig;
}

// ── Theme / Visual Identity ──────────────────────────────────────

export interface ThemeConfig {
  /** Wahrnehmungs-Profil: steuert die gesamte Inszenierung */
  profile: "tradition" | "kompetenz" | "naehe";
  /** Hero-Variante */
  heroStyle: "classic" | "split" | "center";
  /** Farbmodus — steuert Surface/Card/Text-Temperaturen */
  colorMode: "warm" | "cool" | "neutral";
  /** Font-Familie fuer Headings (Body bleibt Geist) */
  fontFamily: "geist" | "inter" | "dm-sans" | "source-serif";
  /** Section-Reihenfolge Override (ohne 'hero' — Hero ist immer oben) */
  sectionOrder?: string[];
  /** Service-Praesentation: grid (3-col) | editorial (2-col mit Bild) | stacked (vertikal) */
  serviceLayout?: "grid" | "editorial" | "stacked";
  /** Review-Inszenierung: grid (3 Karten) | carousel (horizontal scroll) | quote (1 grosses Zitat) */
  reviewStyle?: "grid" | "carousel" | "quote";
  /** Scroll-Animations-Familie */
  animation?: "fade" | "slide" | "scale" | "none";
  /** Button-Radius: rounded (2xl) | pill (full) | sharp (lg) */
  buttonStyle?: "rounded" | "pill" | "sharp";
  /** Section-Divider: gradient | space | line */
  sectionDivider?: "gradient" | "space" | "line";
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
  /** Short description (1-2 sentences) for card preview */
  summary: string;
  /** Longer description for detail view */
  description?: string;
  /** Key competence bullet points for detail view */
  bullets?: string[];
  /** Icon identifier (we map these to SVG icons) */
  icon?: ServiceIcon;
  /** Reference images for this service */
  images?: string[];
}

export type ServiceIcon =
  | "bath"
  | "facade"
  | "flame"
  | "heating"
  | "leaf"
  | "pipe"
  | "pump"
  | "roof"
  | "snowflake"
  | "solar"
  | "tool"
  | "water"
  | "wrench";

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

// ── Wizard Categories ─────────────────────────────────────────────

export interface CustomerCategory {
  /** Value stored in Supabase case.category — MUST match voice agent values */
  value: string;
  /** Display label in wizard UI */
  label: string;
  /** Short hint text below label */
  hint: string;
  /** Icon key for wizard card (maps to CategoryIcon in CustomerWizardForm) */
  iconKey: string;
  /** true = fixed bottom row (Allgemein, Angebot, Kontakt) */
  fixed?: boolean;
}

// ── Careers ───────────────────────────────────────────────────────

export interface JobListing {
  title: string;
  type: "fulltime" | "parttime" | "apprentice";
  description: string;
  requirements?: string[];
}
