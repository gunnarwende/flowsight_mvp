/**
 * Canonical public-facing URL for FlowSight.
 *
 * Used in SMS correction links, email deep-links, review URLs, etc.
 * MUST be the branded domain (flowsight.ch), NEVER the Vercel deployment URL.
 *
 * The env var override exists only for local development. In production,
 * the hardcoded default is always correct.
 */
export const APP_BASE_URL: string =
  process.env.NODE_ENV === "development"
    ? (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    : "https://flowsight.ch";
