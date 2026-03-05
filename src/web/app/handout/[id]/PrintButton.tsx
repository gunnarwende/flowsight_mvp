"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print mb-6 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 print:hidden"
    >
      Drucken / PDF speichern
    </button>
  );
}
