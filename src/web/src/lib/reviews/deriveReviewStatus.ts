// ---------------------------------------------------------------------------
// Review Status Derivation (NS1: computed from case_events, not stored)
// ---------------------------------------------------------------------------

export type ReviewStatus =
  | "moeglich"        // done + contact data + no review sent → green
  | "angefragt"       // review_sent_at set, no surface opened → yellow
  | "geoeffnet"       // surface_opened event → blue
  | "geklickt"        // cta_clicked event → strong green
  | "kein_kontakt"    // done + no contact data → gray
  | "uebersprungen"   // explicit skip → gray
  | "nicht_bereit"    // not done yet → hidden
  ;

export interface ReviewStatusInfo {
  status: ReviewStatus;
  label: string;
  color: string; // Tailwind color class
  canRequest: boolean;
  canResend: boolean;
  canSkip: boolean;
  reviewCount: number;
}

const MAX_REVIEW_REQUESTS = 2;
const RESEND_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CaseEvent {
  event_type: string;
  created_at: string;
}

export function deriveReviewStatus(opts: {
  caseStatus: string;
  hasContactInfo: boolean;
  reviewSentAt: string | null;
  events: CaseEvent[];
}): ReviewStatusInfo {
  const { caseStatus, hasContactInfo, events } = opts;

  // Not done → not ready for review
  if (caseStatus !== "done") {
    return {
      status: "nicht_bereit",
      label: "",
      color: "",
      canRequest: false,
      canResend: false,
      canSkip: false,
      reviewCount: 0,
    };
  }

  const reviewRequests = events.filter(e => e.event_type === "review_requested");
  const reviewCount = reviewRequests.length;
  const hasSkipped = events.some(e => e.event_type === "review_skipped");
  const hasSurfaceOpened = events.some(e => e.event_type === "review_surface_opened");
  const hasCtaClicked = events.some(e => e.event_type === "review_cta_clicked");

  // Explicit skip
  if (hasSkipped) {
    return {
      status: "uebersprungen",
      label: "\u00dcbersprungen",
      color: "bg-gray-100 text-gray-500",
      canRequest: false,
      canResend: false,
      canSkip: false,
      reviewCount,
    };
  }

  // No contact data
  if (!hasContactInfo) {
    return {
      status: "kein_kontakt",
      label: "Kein Kontakt",
      color: "bg-gray-100 text-gray-500",
      canRequest: false,
      canResend: false,
      canSkip: true,
      reviewCount,
    };
  }

  // Never requested
  if (reviewCount === 0) {
    return {
      status: "moeglich",
      label: "Review m\u00f6glich",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      canRequest: true,
      canResend: false,
      canSkip: true,
      reviewCount,
    };
  }

  // Resend eligibility
  const lastRequest = reviewRequests[0]; // already sorted desc by query
  const canResend = reviewCount < MAX_REVIEW_REQUESTS &&
    (Date.now() - new Date(lastRequest.created_at).getTime()) >= RESEND_COOLDOWN_MS;

  // CTA clicked → strongest signal
  if (hasCtaClicked) {
    return {
      status: "geklickt",
      label: "Google ge\u00f6ffnet",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      canRequest: false,
      canResend: false,
      canSkip: false,
      reviewCount,
    };
  }

  // Surface opened
  if (hasSurfaceOpened) {
    return {
      status: "geoeffnet",
      label: "Ge\u00f6ffnet",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      canRequest: false,
      canResend,
      canSkip: true,
      reviewCount,
    };
  }

  // Requested but not opened
  return {
    status: "angefragt",
    label: "Angefragt",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    canRequest: false,
    canResend,
    canSkip: true,
    reviewCount,
  };
}
