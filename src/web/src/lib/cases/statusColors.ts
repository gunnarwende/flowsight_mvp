// ---------------------------------------------------------------------------
// Shared status colors, labels, urgency helpers — single source of truth
// Used by LeitzentraleView + TechnikerView
// ---------------------------------------------------------------------------

export const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  scheduled: "Geplant",
  in_arbeit: "In Arbeit",
  warten: "Warten",
  done: "Erledigt",
};

export const URGENCY_DOT: Record<string, string> = {
  notfall: "bg-red-500",
  dringend: "bg-amber-500",
  normal: "bg-gray-400",
};

export const URGENCY_LABEL: Record<string, string> = {
  notfall: "Hoch",
  dringend: "Mittel",
  normal: "Normal",
};

/**
 * Returns Tailwind classes for a case status badge.
 * FB6: in_arbeit=orange, warten=grau, done+review=gold-ring, done+rating≥4=gold
 */
export function getStatusColorClass(
  status: string,
  reviewSentAt?: string | null,
  reviewRating?: number | null,
): string {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "scheduled":
      return "bg-violet-100 text-violet-700";
    case "in_arbeit":
      return "bg-orange-100 text-orange-700";
    case "warten":
      return "bg-gray-100 text-gray-600";
    case "done":
      if (reviewRating != null && reviewRating >= 4)
        return "bg-amber-100 text-amber-800 ring-2 ring-amber-400";
      if (reviewSentAt)
        return "bg-emerald-100 text-emerald-700 ring-2 ring-amber-400";
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
