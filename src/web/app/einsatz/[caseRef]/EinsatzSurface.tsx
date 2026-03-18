"use client";

import { useState } from "react";

interface Props {
  caseId: string;
  caseLabel: string;
  tenantName: string;
  brandColor: string;
  status: string;
  category: string;
  urgency: string;
  description: string;
  street?: string | null;
  houseNumber?: string | null;
  plz: string;
  city: string;
  reporterName?: string | null;
  contactPhone?: string | null;
  scheduledAt?: string | null;
  scheduledEndAt?: string | null;
  assigneeText?: string | null;
  token: string;
  caseRef: string;
}

const URGENCY_LABELS: Record<string, string> = {
  notfall: "Notfall",
  dringend: "Dringend",
  normal: "Normal",
};

function formatTermin(scheduledAt: string, scheduledEndAt?: string | null): string {
  const start = new Date(scheduledAt);
  const day = start.toLocaleDateString("de-CH", { weekday: "short", timeZone: "Europe/Zurich" });
  const date = start.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Zurich" });
  const time = start.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
  if (scheduledEndAt) {
    const end = new Date(scheduledEndAt);
    const endTime = end.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
    return `${day} ${date}, ${time}–${endTime}`;
  }
  return `${day} ${date}, ${time}`;
}

function mapsUrl(street?: string | null, houseNumber?: string | null, plz?: string, city?: string): string {
  const parts = [street, houseNumber, plz, city].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
}

export function EinsatzSurface(props: Props) {
  const [actionState, setActionState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [currentStatus, setCurrentStatus] = useState(props.status);

  const address = [props.street, props.houseNumber].filter(Boolean).join(" ");
  const fullAddress = [address, `${props.plz} ${props.city}`].filter(Boolean).join(", ");
  const hasAddress = !!(props.street || props.plz);

  async function updateStatus(newStatus: string) {
    setActionState("saving");
    try {
      const res = await fetch(`/api/einsatz/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseRef: props.caseRef,
          token: props.token,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Update fehlgeschlagen");
      setCurrentStatus(newStatus);
      setActionState("saved");
      setTimeout(() => setActionState("idle"), 3000);
    } catch {
      setActionState("error");
      setTimeout(() => setActionState("idle"), 4000);
    }
  }

  const isDone = currentStatus === "done";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="rounded-xl p-4 text-white" style={{ backgroundColor: props.brandColor }}>
        <p className="text-xs font-medium opacity-80">{props.tenantName}</p>
        <h1 className="text-lg font-bold mt-0.5">{props.caseLabel} — {props.category}</h1>
        {props.scheduledAt && (
          <p className="text-sm mt-1 opacity-90">
            {formatTermin(props.scheduledAt, props.scheduledEndAt)}
          </p>
        )}
      </div>

      {/* Address + Maps */}
      {hasAddress && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Adresse</p>
          <p className="text-sm font-medium text-gray-900">{fullAddress}</p>
          <a
            href={mapsUrl(props.street, props.houseNumber, props.plz, props.city)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            Navigation starten
          </a>
        </div>
      )}

      {/* Problem description */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Problembeschreibung</p>
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            props.urgency === "notfall" ? "bg-red-100 text-red-700" :
            props.urgency === "dringend" ? "bg-amber-100 text-amber-700" :
            "bg-gray-100 text-gray-600"
          }`}>{URGENCY_LABELS[props.urgency] ?? props.urgency}</span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{props.description || "—"}</p>
      </div>

      {/* Contact */}
      {(props.reporterName || props.contactPhone) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kunde</p>
          {props.reporterName && <p className="text-sm font-medium text-gray-900">{props.reporterName}</p>}
          {props.contactPhone && (
            <a href={`tel:${props.contactPhone}`} className="inline-flex items-center gap-1.5 mt-1 text-sm text-blue-600 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              {props.contactPhone}
            </a>
          )}
        </div>
      )}

      {/* Status Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status melden</p>

        {isDone ? (
          <div className="flex items-center gap-2 text-emerald-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm font-semibold">Einsatz erledigt</span>
          </div>
        ) : (
          <div className="space-y-2">
            {currentStatus !== "in_arbeit" && (
              <button
                onClick={() => updateStatus("in_arbeit")}
                disabled={actionState === "saving"}
                className="w-full rounded-lg border-2 border-gray-900 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Bin vor Ort
              </button>
            )}
            <button
              onClick={() => updateStatus("done")}
              disabled={actionState === "saving"}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-50"
            >
              {actionState === "saving" ? "Wird gespeichert…" : "Arbeit erledigt"}
            </button>
          </div>
        )}

        {actionState === "saved" && (
          <p className="text-xs text-emerald-600 font-medium mt-2">Status aktualisiert</p>
        )}
        {actionState === "error" && (
          <p className="text-xs text-red-600 font-medium mt-2">Aktualisierung fehlgeschlagen — bitte erneut versuchen</p>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pt-2">
        {props.tenantName} — Leitsystem
      </p>
    </div>
  );
}
